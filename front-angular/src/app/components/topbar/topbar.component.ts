import { CommonModule, NgIf, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = '';
  sector: string | null = '';
  currentRoute: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateLocalData();
          this.currentRoute = event.urlAfterRedirects;
        }
      });
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateLocalData();
      this.currentRoute = this.router.url;
    }
  }

  updateLocalData() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.username = localStorage.getItem('username');
    this.sector = localStorage.getItem('sector');

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Array.isArray(payload.roles)) {
          this.isAdmin = payload.roles.includes('admin');
        } else {
          this.isAdmin = payload.role === 'admin';
        }
      } catch {
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('sector');
      this.router.navigate(['/login']);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
