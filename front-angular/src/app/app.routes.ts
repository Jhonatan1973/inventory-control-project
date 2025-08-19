import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guard/AuthGuard';
import { StockComponent } from './pages/stock/stock.component';
import { RegisterComponent } from './pages/register/register.component';
import { ConfigComponent } from './pages/config/config.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'stock', component: StockComponent, canActivate: [AuthGuard]},
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard]},
  { path: 'config', component: ConfigComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
