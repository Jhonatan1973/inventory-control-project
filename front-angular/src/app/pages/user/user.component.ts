import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [TopbarComponent, MenuDesktopComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  username: string | null = '';
  sector: string | null = '';
  isAdmin = false;
  isLoggedIn = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateLocalData();
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
}
