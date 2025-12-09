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
    <!-- ✅ FULL SCREEN SPINNER -->
    <div *ngIf="isWakingUp" 
         class="vh-100 d-flex flex-column justify-content-center align-items-center bg-body text-body">
      
      <div class="spinner-border mb-3" role="status"></div>
      <h5>Waking up server...</h5>
      <small class="opacity-75">This may take up to 30 seconds</small>
    </div>

    <!-- ✅ NORMAL APP -->
    <ng-container *ngIf="!isWakingUp">
      <app-header></app-header>
      <div class="bg-body text-body">
        <router-outlet></router-outlet>
      </div>

      <app-sticky-button></app-sticky-button>
    </ng-container>
  `
})
export class App implements OnInit {

  isWakingUp = true;   // ✅ controls spinner

  constructor(
    private authState: AuthStateService,
    private api: ApiService,
    private router: Router,
    private signalR: SignalRService
  ) {}

  ngOnInit() {
    this.wakeUpBackend();
  }

  // ✅ Render Wake-up Logic
  private wakeUpBackend() {
    this.api.getTest().subscribe({
      next: () => {
        console.log('Backend awake ✅');
        this.isWakingUp = false;
        this.initializeAuthState();
        setInterval(() => this.initializeAuthState(), 60_000);
      },
      error: () => {
        console.log('Still waking up... retrying');
        setTimeout(() => this.wakeUpBackend(), 3000); // retry every 3s
      }
    });
  }

  private initializeAuthState() {
    this.api.getAuthMe().subscribe({
      next: user => {
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
