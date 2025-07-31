import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
  standalone: true,
})
export class TopbarComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = '';
  sectors: string | null = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.isLoggedIn = !!localStorage.getItem('token');
          this.username = localStorage.getItem('username');
          this.sectors = localStorage.getItem('sectors');
        }
      });
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('token');
      this.username = localStorage.getItem('username');
      this.sectors = localStorage.getItem('sectors');
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('sectors');
      window.location.href = '/login';
    }
  }
}