import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserInterface } from '../../interfaces/user/user-interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { NotificationService, Notificacao } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [TopbarComponent, MenuDesktopComponent, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  showNotificationModal = false;
  showEditCard = false;
  showDeleteModal = false;
  showConfirm = false;
  showNewUserModal = false;

  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  totalUsers = 0;
  searchText = '';
  selectedRole: 'Todos' | string = 'Todos';
  selectedUser: UserInterface | null = null;
  userToDelete: UserInterface | null = null;
  deleteConfirmationText = '';
  originalUser: UserInterface | null = null;
  loggedUserRole: string = '';

  newUser: UserInterface = this.getEmptyUser();

  newNotification = {
    titulo: '',
    descricao: '',
    hora: '',
    destinatarios: [] as string[],
    tipo: 'Urgência',
  };

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) { }
  ngOnInit() {
    this.loggedUserRole = localStorage.getItem('role') || '';
    this.loadUsers();
  }
  canEdit() { return this.loggedUserRole === 'ADMIN'; }
  canDelete() { return this.loggedUserRole === 'ADMIN'; }
  canCreate() { return this.loggedUserRole === 'ADMIN'; }
  loadUsers() {
    this.userService.getUsersBySector().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.totalUsers = this.users.length;
      },
      error: (err) => console.error('Erro ao carregar usuários', err),
    });
  }
  getEmptyUser(): UserInterface {
    return {
      id: 0,
      username: '',
      email: '',
      password: '',
      roleName: localStorage.getItem('role')?.toLowerCase() || 'user',
      sectorName: localStorage.getItem('sector') || '',
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
    const roleId = Number(localStorage.getItem('roleId')) || 2;
    const sectorId = Number(localStorage.getItem('sectorId')) || 1;
    const payload = {
      username: this.newUser.username,
      email: this.newUser.email,
      password: this.newUser.password,
      roleId,
      role: { id: roleId, name: this.newUser.roleName.toUpperCase() },
      sectorId,
      sector: { id: sectorId, name: this.newUser.sectorName },
      lastModified: this.getTodayDate()
    };
    this.userService.createUser(payload).subscribe({
      next: () => {
        this.closeNewUserModal();
        this.loadUsers();
        this.resetNewUser();
        alert('Usuário criado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        alert(err?.error?.message || 'Erro ao criar usuário. Verifique os dados.');
      }
    });
  }
  editUser(user: UserInterface) {
    this.selectedUser = { ...user };
    this.originalUser = { ...user };
    this.showEditCard = true;
    this.showConfirm = false;
  }
  confirmSave() {
    if (!this.selectedUser) return;
    this.userService.updateUser(this.selectedUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index > -1) this.users[index] = updatedUser;
        this.searchUsers();
        this.closeEditCard();
      },
      error: () => alert('Erro ao atualizar usuário. Tente novamente.')
    });
  }
  cancelSave() { this.showConfirm = false; }
  openDeleteModal(user: UserInterface) {
    this.userToDelete = user;
    this.deleteConfirmationText = '';
    this.showDeleteModal = true;
  }
  confirmDelete() {
    if (this.userToDelete && this.deleteConfirmationText === this.userToDelete.username) {
      this.userService.deleteUser(this.userToDelete.id!).subscribe(() => {
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.closeDeleteModal();
        this.searchUsers();
      });
    } else alert('Digite corretamente o nome do usuário para confirmar a exclusão.');
  }
  openNewUserModal() {
    this.resetNewUser();
    this.showNewUserModal = true;
  }
  closeNewUserModal() {
    this.showNewUserModal = false;
  }
  closeEditCard() { this.showEditCard = false; this.selectedUser = null; this.showConfirm = false; }
  closeDeleteModal() { this.showDeleteModal = false; this.userToDelete = null; this.deleteConfirmationText = ''; }
  searchUsers() {
    const text = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user => {
      const matchesText = user.username?.toLowerCase().includes(text) || user.email?.toLowerCase().includes(text);
      const matchesRole = this.selectedRole === 'Todos' || user.roleName === this.selectedRole;
      return matchesText && matchesRole;
    });
  }
  setRoleFilter(role: 'Todos' | string) { this.selectedRole = role; this.searchUsers(); }
  generateRandomPassword() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) password += charset.charAt(Math.floor(Math.random() * charset.length));
    this.newUser.password = password;
  }
  getTodayDate(): string {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(2)}`;
  }
  formatDateTime(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const brasiliaDate = new Date(utc + -3 * 60 * 60000);
    return `${String(brasiliaDate.getDate()).padStart(2, '0')}/${String(brasiliaDate.getMonth() + 1).padStart(2, '0')}/${brasiliaDate.getFullYear()} ${String(brasiliaDate.getHours()).padStart(2, '0')}:${String(brasiliaDate.getMinutes()).padStart(2, '0')}`;
  }
  openModalNotification() {
    this.showNotificationModal = true;
    this.newNotification.destinatarios = this.users.map(u => u.username!);
    this.newNotification.titulo = '';
    this.newNotification.descricao = '';
    this.newNotification.hora = '';
  }
  closeModalNotification() { this.showNotificationModal = false; }
  sendNotification() {
    if (!this.newNotification.titulo || !this.newNotification.descricao || this.newNotification.destinatarios.length === 0) {
      alert('Preencha todos os campos e selecione pelo menos um destinatário.');
      return;
    }
    const sectorId = Number(localStorage.getItem('sectorId')) || 1;
    const notificacao: Notificacao = {
      titulo: `(${this.newNotification.tipo}) ${this.newNotification.titulo}`,
      mensagem: this.newNotification.descricao,
      dataCriacao: new Date().toISOString(),
      lida: false,
      sectorId
    };
    this.notificationService.criarNotificacao(notificacao).subscribe({
      next: () => { alert('Notificação enviada com sucesso!'); this.closeModalNotification(); },
      error: (err) => { console.error('Erro ao enviar notificação', err); alert('Erro ao enviar notificação.'); }
    });
  }
  askForConfirm() { this.showConfirm = true; }
}