import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [TopbarComponent, MenuDesktopComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
})
export class HomeComponent implements OnInit {
  sectorName: string | null = '';
  role: string | null = '';
  isLoggedIn = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.isLoggedIn = !!localStorage.getItem('token');
          this.role = localStorage.getItem('role');
          this.sectorName = localStorage.getItem('sector');
        }
      });
    }
  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('token');
      this.role = localStorage.getItem('role');
      this.sectorName = localStorage.getItem('sector');
    }
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('roleName');
      localStorage.removeItem('sectorName');
      window.location.href = '/login';
    }
  }
}
