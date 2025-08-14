import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserInterface } from '../../interfaces/user/user-interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [TopbarComponent, MenuDesktopComponent, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  totalUsers = 0;
  searchText = '';
  selectedRole: 'Todos' | string = 'Todos';
  selectedUser: UserInterface | null = null;
  showEditCard = false;
  showDeleteModal = false;
  userToDelete: UserInterface | null = null;
  deleteConfirmationText = '';
  newUser: UserInterface = this.getEmptyUser();
  originalUser: UserInterface | null = null;
  showConfirm = false;
  code = '';
  countdown = 60;
  codeSent = false;
  intervalId: any = null;
  emailPendingConfirmation = '';
  showCodeModal = false;
  message = '';

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.loadUsers();
  }
loadUsers() {
  this.userService.getUsersBySector().subscribe({
    next: (data) => {
      this.users = data;
      this.filteredUsers = [...this.users];
      this.totalUsers = this.users.length;
    },
    error: (err) => {
      console.error('Erro ao carregar usuários', err);
    },
  });
}

  getEmptyUser(): UserInterface {
    return {
      id: 0,
      username: '',
      email: '',
      password: '',
      roleName: 'user',
      sectorName: '',
      lastModified: this.getTodayDate(),
    };
  }
  resetNewUser() {
    this.newUser = this.getEmptyUser();
  }
  createUser() {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.roleName || !this.newUser.password) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.emailPendingConfirmation = this.newUser.email!;
        this.sendVerificationCode(this.emailPendingConfirmation);
        this.showCodeModal = true;
        this.startCountdown();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        alert('Erro ao criar usuário. Verifique os dados e tente novamente.');
      },
    });
  }
  sendVerificationCode(email: string) {
    this.userService.sendVerificationCode(email).subscribe({
      next: () => {
        this.codeSent = true;
        this.message = 'Código enviado para o email.';
      },
      error: () => {
        this.message = 'Erro ao enviar código. Tente novamente.';
      },
    });
  }
  confirmCode() {
    this.userService.verifyCode(this.emailPendingConfirmation, this.code).subscribe({
      next: () => {
        this.userService.confirmUser(this.emailPendingConfirmation, this.code).subscribe({
          next: () => {
            this.loadUsers();
            this.resetNewUser();
            this.showCodeModal = false;
            alert('Usuário confirmado. Um email foi enviado para redefinir a senha.');
          },
          error: () => alert('Erro ao confirmar usuário.'),
        });
      },
      error: () => {
        this.message = 'Código inválido ou expirado.';
      },
    });
  }
  startCountdown() {
    this.countdown = 60;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
  resendCode() {
    if (this.countdown <= 0) {
      this.sendVerificationCode(this.emailPendingConfirmation);
      this.startCountdown();
    }
  }
  searchUsers() {
    const text = this.searchText.toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesText =
        user.username?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text);

      const matchesRole = this.selectedRole === 'Todos' || user.roleName === this.selectedRole;

      return matchesText && matchesRole;
    });
  }
  setRoleFilter(role: 'Todos' | string) {
    this.selectedRole = role;
    this.searchUsers();
  }
  openModal() {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'flex';
  }
  closeModal() {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
  }
  editUser(user: UserInterface) {
    this.selectedUser = { ...user };
    this.originalUser = { ...user };
    this.showEditCard = true;
    this.showConfirm = false;
  }
  closeEditCard() {
    this.showEditCard = false;
    this.selectedUser = null;
    this.showConfirm = false;
  }
  saveEdit() {
    if (this.selectedUser) {
      const index = this.users.findIndex((u) => u.id === this.selectedUser!.id);
      if (index > -1) {
        this.users[index] = {
          ...this.selectedUser,
          lastModified: this.getTodayDate(),
        };
        this.searchUsers();
      }
      this.closeEditCard();
    }
  }
  askForConfirm() {
    this.showConfirm = true;
  }
  confirmSave() {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index > -1) {
            this.users[index] = updatedUser;
            this.searchUsers();
          }
          this.closeEditCard();
        },
        error: (err) => {
          console.error('Erro ao atualizar usuário:', err);
          alert('Erro ao atualizar usuário. Tente novamente.');
        },
      });
    }
  }
  cancelSave() {
    this.showConfirm = false;
  }
  openDeleteModal(user: UserInterface) {
    this.userToDelete = user;
    this.deleteConfirmationText = '';
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.deleteConfirmationText = '';
  }
  confirmDelete() {
    if (this.userToDelete && this.deleteConfirmationText === this.userToDelete.username) {
      this.userService.deleteUser(this.userToDelete.id!).subscribe(() => {
        this.users = this.users.filter((u) => u.id !== this.userToDelete!.id);
        this.closeDeleteModal();
        this.searchUsers();
      });
    } else {
      alert('Digite corretamente o nome do usuário para confirmar a exclusão.');
    }
  }
  generateRandomPassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    this.newUser.password = password;
  }
  getTodayDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  }
  formatDateTime(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const brasiliaOffset = -3 * 60;
    const brasiliaDate = new Date(utc + brasiliaOffset * 60000);
    const day = String(brasiliaDate.getDate()).padStart(2, '0');
    const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
    const year = brasiliaDate.getFullYear();
    const hours = String(brasiliaDate.getHours()).padStart(2, '0');
    const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
