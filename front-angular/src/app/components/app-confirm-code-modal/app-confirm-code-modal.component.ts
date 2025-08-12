import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-confirm-code-modal',
  template: `
  <div class="modal">
    <h3>Confirme seu código</h3>
    <input type="text" [(ngModel)]="code" placeholder="Digite o código recebido" />
    <button (click)="confirmCode()" [disabled]="code.trim() === ''">Confirmar</button>

    <div *ngIf="countdown > 0">Código expira em: {{countdown}}s</div>

    <button (click)="resendCode()" [disabled]="countdown > 0">Reenviar código</button>

    <div *ngIf="message">{{message}}</div>
  </div>
  `,
  styles: [`.modal {background: #fff; padding: 20px; border-radius: 8px;}`],
})
export class ConfirmCodeModalComponent implements OnInit {
  @Input() email!: string;
  @Output() confirmed = new EventEmitter<void>();

  code = '';
  countdown = 60;
  timerSubscription!: Subscription;
  message = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.startTimer();
    this.sendCode();
  }

  startTimer() {
    this.countdown = 60;
    if(this.timerSubscription) this.timerSubscription.unsubscribe();
    this.timerSubscription = timer(0, 1000).subscribe(sec => {
      this.countdown = 60 - sec;
      if (this.countdown <= 0) this.timerSubscription.unsubscribe();
    });
  }

  sendCode() {
    this.userService.sendVerificationCode(this.email).subscribe({
      next: () => {
        this.message = 'Código enviado para seu email.';
      },
      error: () => {
        this.message = 'Erro ao enviar código. Tente novamente.';
      }
    });
  }

  resendCode() {
    if (this.countdown <= 0) {
      this.startTimer();
      this.sendCode();
    }
  }

  confirmCode() {
    this.userService.verifyCode(this.email, this.code).subscribe({
      next: () => {
        this.userService.confirmUser(this.email, this.code).subscribe({
          next: () => {
            this.message = 'Usuário confirmado!';
            this.confirmed.emit();
          },
          error: () => {
            this.message = 'Erro ao confirmar usuário.';
          }
        });
      },
      error: () => {
        this.message = 'Código inválido ou expirado.';
      }
    });
  }
}