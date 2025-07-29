import { Component, OnDestroy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('600ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-15px)' })),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnDestroy {
  email = '';
  senha = '';
  showPassword = false;
  isLogin = true;

  showForm = true;
  waitingApproval = false;

  countdown = 60;
  expired = false;
  private timerSubscription?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
onSubmit(): void {
  if (this.isLogin) {
    this.authService.login(this.email, this.senha).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('sectors', res.sectors);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        alert('Email ou senha inválidos');
      }
    });
  }
}
  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }
}
