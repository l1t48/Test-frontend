import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthStateService } from '../../services/auth-state.service';
import { Router, NavigationEnd  } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { filter } from 'rxjs'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="auth.isAuthenticated()"> 
      <nav class="navbar navbar-expand-lg bg-body text-body border-bottom">
        <div class="container-fluid">
          <button class="nav-link fs-5 fw-normal" (click)="navigateTo('/books')">Ink & Insight <i class="fa-solid fa-pen-fancy fs-6 text-primary"></i></button>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse mt-3 mt-lg-0" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <button class="nav-link"
                  [class.active]="active === '/books'"
                  [class.text-primary]="active === '/books'"
                  (click)="navigateTo('/books')">
                  Books <i class="fa-solid fa-book-open"></i>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link"
                  [class.active]="active === '/quotes'"
                  [class.text-primary]="active === '/quotes'"
                  (click)="navigateTo('/quotes')">
                  Quotes <i class="fa-brands fa-pied-piper-hat"></i>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" (click)="logout()">
                  Logout <i class="fa-solid fa-arrow-right-from-bracket"></i> 
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  `
})
export class HeaderComponent {
  active: string = ''; // default active

  constructor(
    public auth: AuthStateService,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    // Set active based on current route
    this.active = this.router.url;

    // Optional: update active if navigation happens elsewhere
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.active = event.urlAfterRedirects;
      });
  }

  navigateTo(path: string) {
    this.active = path;
    this.router.navigate([path]);
  }

  logout() {
    // Call backend logout endpoint
    this.api.logout({}).subscribe({
      next: () => console.log('Logged out on backend'),
      error: () => console.warn('Backend logout failed')
    });

    // Clear frontend auth state
    this.auth.clear();

    // Redirect to login page
    this.router.navigate(['/auth']);
  }
}
