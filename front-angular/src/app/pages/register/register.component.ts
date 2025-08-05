import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service'; // ajuste o caminho se precisar
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
  users: User[] = [];
  filteredUsers: User[] = [];
  totalUsers = 0;

  searchText = '';
  selectedRole: 'Todos' | string = 'Todos';

  selectedUser: User | null = null;
  showEditCard = false;

  showDeleteModal = false;
  userToDelete: User | null = null;
  deleteConfirmationText = '';

  newUser: User = this.getEmptyUser();

  // Guarda cópia do usuário antes da edição para comparação (se quiser)
  originalUser: User | null = null;
  showConfirm = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
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

  // Retorna um usuário vazio com lastModified inicializado
  getEmptyUser(): User {
    return {
      id: 0,
      username: '',
      email: '',
      password: '', 
      role: 'user',
      sectors: '',
      lastModified: this.getTodayDate(),
    };
  }

  resetNewUser() {
    this.newUser = this.getEmptyUser();
  }

createUser() {
  if (
    !this.newUser.username ||
    !this.newUser.email ||
    !this.newUser.role ||
    !this.newUser.password
  ) {
    alert('Preencha todos os campos obrigatórios, incluindo a senha.');
    return;
  }

  this.userService.createUser(this.newUser).subscribe({
    next: (createdUser) => {
      this.users.push(createdUser);
      this.searchUsers();
      this.closeModal();
      this.resetNewUser();
    },
    error: (err) => {
      console.error('Erro ao criar usuário:', err);
      alert('Erro ao criar usuário.');
    },
  });
}

generateRandomPassword() {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  this.newUser.password = password;
}

  searchUsers() {
    const text = this.searchText.toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesText =
        user.username.toLowerCase().includes(text) ||
        user.email.toLowerCase().includes(text);

      const matchesRole =
        this.selectedRole === 'Todos' || user.role === this.selectedRole;

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

  editUser(user: User) {
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
formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Ajusta para horário de Brasília (GMT-3)
  // Converte para UTC e depois subtrai 3 horas para Brasília
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const brasiliaOffset = -3 * 60; // minutos
  const brasiliaDate = new Date(utc + brasiliaOffset * 60000);

  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const year = brasiliaDate.getFullYear();
  const hours = String(brasiliaDate.getHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
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

  openDeleteModal(user: User) {
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
    if (
      this.userToDelete &&
      this.deleteConfirmationText === this.userToDelete.username
    ) {
      this.userService.deleteUser(this.userToDelete.id).subscribe(() => {
        this.users = this.users.filter((u) => u.id !== this.userToDelete!.id);
        this.closeDeleteModal();
        this.searchUsers();
      });
    } else {
      alert(
        'Digite corretamente o nome do usuário para confirmar a exclusão.'
      );
    }
  }

  getTodayDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  }
}
