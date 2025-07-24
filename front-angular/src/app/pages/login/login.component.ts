import { Component, OnDestroy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';

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
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-15px)' })),
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
  selectedSector = '';

  fullName = '';
  password = '';
  confirmPassword = '';

  countdown = 60;
  expired = false;
  private timerSubscription?: Subscription;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  switchToLogin(): void {
    this.isLogin = true;
    this.showForm = true;
    this.waitingApproval = false;
    this.resetTimer();
  }

  switchToRegister(): void {
    this.isLogin = false;
    this.showForm = true;
    this.waitingApproval = false;
    this.resetTimer();
  }

  onSubmit(form?: any): void {
    if (this.isLogin) {
      console.log('Fazendo login com:', this.email, this.senha);
      // lógica de login aqui
    } else {
      if (!this.selectedSector) {
        alert('Por favor, selecione um setor para continuar.');
        return;
      }
      // aqui pode validar senha, nome, confirmação, etc. se quiser
      this.showForm = false;
      this.waitingApproval = true;
      this.startTimer();
    }
  }

  startTimer(): void {
    this.countdown = 60;
    this.expired = false;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.expired = true;
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  resetTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.countdown = 60;
    this.expired = false;
  }

  resendRequest(): void {
    this.resetTimer();
    this.startTimer();
    // lógica para reenviar solicitação pode ir aqui
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }
}
