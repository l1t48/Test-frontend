import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeSwitcher } from './components/general/theme-switcher';
import { HeaderComponent } from './components/general/header';
import { AuthStateService } from './services/auth-state.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { SignalRService } from './services/signalr.service';
import { tap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ThemeSwitcher, HeaderComponent, CommonModule],
    template: `
        <div *ngIf="!isAppReady" class="d-flex justify-content-center align-items-center vh-100">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="ms-3">Waking up server...</p>
        </div>

        <ng-container *ngIf="isAppReady">
            <app-header></app-header>
            <div class="bg-body text-body">
                <router-outlet></router-outlet>
            </div>
            <app-sticky-button></app-sticky-button>
        </ng-container>
    `
})
export class App implements OnInit {
    public isAppReady: boolean = false; 

    constructor(
        private authState: AuthStateService,
        private api: ApiService,
        private router: Router,
        private signalR: SignalRService
    ) { }

    ngOnInit() {
        this.wakeupServerAndInitialize();
        setInterval(() => {
            if (this.isAppReady) {
                this.initializeAuthState();
            }
        }, 60_000);
    }

    private wakeupServerAndInitialize() {
        this.api.getTest().pipe(
            tap(() => {
                console.log('Server is awake.');
            }),
            catchError((error) => {
                console.warn('Server wakeup call failed, proceeding anyway:', error);
                return of(null);
            })
        ).subscribe({
            complete: () => {
                this.initializeAuthState(); 
                this.isAppReady = true;
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