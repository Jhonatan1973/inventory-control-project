import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
canActivate(route: ActivatedRouteSnapshot): boolean {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    const userRole = localStorage.getItem('role');
    const attemptedRoute = route.routeConfig?.path;
    if (attemptedRoute === 'register' && userRole !== 'ADMIN') {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
  this.router.navigate(['/login']);
  return false;
}
}
