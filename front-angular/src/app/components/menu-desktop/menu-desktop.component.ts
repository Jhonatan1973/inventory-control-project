import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu-desktop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-desktop.component.html',
  styleUrls: ['./menu-desktop.component.css'],
})
export class MenuDesktopComponent implements OnInit {
  currentRoute: string = '';
  isAdmin = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAdminRole();
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.checkAdminRole();
      });
  }
checkAdminRole() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (Array.isArray(payload.roles)) {
        this.isAdmin = payload.roles.includes('admin');
      } else {
        this.isAdmin = payload.role === 'admin';
      }
    } catch (e) {
      this.isAdmin = false;
      console.error('Erro ao analisar token:', e);
    }
  } else {
    this.isAdmin = false;
    console.error('Token não encontrado');
  }
}
navigateTo(page: string) {
    if (page) {
      this.router.navigateByUrl(page);
      this.currentRoute = page;
    }
  }
}
