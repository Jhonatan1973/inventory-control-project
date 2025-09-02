import { CommonModule, NgIf, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NotificationService, Notificacao } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = '';
  sector: string | null = '';
  currentRoute: string = '';
  notificacoes: Notificacao[] = [];
  notificacoesFiltradas: Notificacao[] = [];
  modalNotificacaoAberto = false;
  modalFixo = false;
  modalFiltroAberto = false;

  filtroDataInicio: string = '';
  filtroDataFim: string = '';
  filtroStatus: string = 'Todos';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private notificationService: NotificationService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateLocalData();
          this.currentRoute = event.urlAfterRedirects;
        }
      });
    }
  }
  ngOnInit() {
    this.updateLocalData();
    const sectorId = localStorage.getItem('sectorId');
    if (sectorId) {
      this.loadNotifications(Number(sectorId));
    }
  }
  loadNotifications(sectorId: number) {
    this.notificationService.getNotificacoesPorSetor(sectorId).subscribe({
      next: (data) => {
        this.notificacoes = data;
        this.notificacoesFiltradas = [...data];
      },
      error: (err) => console.error('Erro ao carregar notificações', err)
    });
  }
  updateLocalData() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.username = localStorage.getItem('username');
    this.sector = localStorage.getItem('sector');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.isAdmin = Array.isArray(payload.roles)
          ? payload.roles.includes('ADMIN')
          : payload.role === 'ADMIN';
      } catch {
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('sector');
      localStorage.removeItem('sectorId');
      this.router.navigate(['/login']);
    }
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  abrirModalNotificacao() {
    this.modalNotificacaoAberto = true;
  }
  fecharModalNotificacao() {
    this.modalNotificacaoAberto = false;
  }
  abrirFiltroDataModal() {
    this.modalFiltroAberto = true;
  }
  fecharFiltroDataModal() {
    if (!this.modalFixo) {
      this.modalFiltroAberto = false;
    }
  }
  toggleFixarModal() {
    this.modalFixo = !this.modalFixo;
  }
  filtrarPorData() {
    const inicio = this.filtroDataInicio ? new Date(this.filtroDataInicio) : new Date('1970-01-01');
    const fim = this.filtroDataFim ? new Date(this.filtroDataFim) : new Date();

    this.notificacoesFiltradas = this.notificacoes.filter(n => {
      const data = new Date(n.dataCriacao);
      return data >= inicio && data <= fim;
    });
    this.modalFiltroAberto = true;
  }
  limparFiltro() {
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.notificacoesFiltradas = [...this.notificacoes];
  }
  filtrarPorStatus(status: string) {
    this.filtroStatus = status;

    if (status === 'Todos') {
      this.notificacoesFiltradas = [...this.notificacoes];
    } else {
      this.notificacoesFiltradas = this.notificacoes.filter(
        n => n.titulo?.toLowerCase().includes(status.toLowerCase())
      );
    }
  } apagarTodasNotificacoes() {
    if (!confirm('Tem certeza que deseja apagar todas as notificações? Esta ação não pode ser desfeita.')) {
      return;
    }
    const sectorId = Number(localStorage.getItem('sectorId')) || 1;
    this.notificationService.deletarTodasNotificacoesDoSetor(sectorId).subscribe({
      next: () => {
        alert('Todas as notificações foram apagadas com sucesso!');
        this.notificacoes = [];
        this.notificacoesFiltradas = [];
        this.modalNotificacaoAberto = false;
      },
      error: (err) => {
        console.error('Erro ao apagar notificações', err);
        alert('Não foi possível apagar as notificações. Tente novamente.');
      }
    });
  }
}
