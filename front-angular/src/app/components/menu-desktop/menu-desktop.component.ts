import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu-desktop',
  templateUrl: './menu-desktop.component.html',
  styleUrls: ['./menu-desktop.component.css'],
  standalone: true,
})
export class MenuDesktopComponent implements OnInit {
  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  navigateTo(page: string) {
    if (page) {
      this.router.navigateByUrl(page);
      this.currentRoute = page;
    }
  }
}
