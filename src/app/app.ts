import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeSwitcher } from './components/general/theme-switcher';
import { HeaderComponent } from './components/general/header';
import { AuthStateService } from './services/auth-state.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { SignalRService } from './services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ThemeSwitcher, HeaderComponent],
  template: `
    <app-header></app-header>

    <!-- ✅ LOADING STATE -->
    <div *ngIf="isLoading" class="vh-100 d-flex flex-column justify-content-center align-items-center">
      <div class="spinner-border mb-3"></div>
      <h5>Starting server...</h5>
    </div>

    <!-- ✅ APP RENDERS ONLY AFTER TEST SUCCESS -->
    <div *ngIf="!isLoading" class="bg-body text-body">
      <router-outlet></router-outlet>
    </div>

    <app-sticky-button></app-sticky-button>
  `
})
export class App implements OnInit {

  isLoading = true;

  constructor(
    private authState: AuthStateService,
    private api: ApiService,
    private router: Router,
    private signalR: SignalRService
  ) { }

  ngOnInit() {
    this.waitForBackend();
  }

  /** ✅ ONLY responsibility: unlock app when backend wakes */
  private waitForBackend() {
    this.api.getTest().subscribe({
      next: () => {
        // ✅ Backend is awake → unlock app
        this.isLoading = false;
        this.initializeAuthState();
        setInterval(() => this.initializeAuthState(), 60_000);
      },
      error: () => {
        // ❌ Backend still asleep → stay loading (no redirect, no crash)
        setTimeout(() => this.waitForBackend(), 3000);
      }
    });
  }

  private initializeAuthState() {
    this.api.getAuthMe().subscribe({
      next: user =>{
        this.authState.setUser(user);
        this.signalR.startConnection(this.api.baseUrlLocalWitoutAPI); 
      },
      error: () => {
        this.authState.clear();
        this.signalR.stopConnection();
        if (this.router.url !== '/auth') {
          this.router.navigate(['/auth']);
        }
      }
    });
  }
}
