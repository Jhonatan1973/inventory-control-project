import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { UserTableService } from '../../services/user-table.service';
import { Historico } from '../../interfaces/user-table/historico';

@Component({
  selector: 'app-home',
  imports: [TopbarComponent, MenuDesktopComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
})
export class HomeComponent implements OnInit {
  sectorName: string | null = '';
  role: string | null = '';
  isLoggedIn = false;
  totalItensSetor: number = 0;
  temQuantidade: number = 0; 
  tabelasSetor: any[] = [];
  historicoSetor: Historico[] = [];
  ultimaAtualizacao: string = '';
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private userTableService: UserTableService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.isLoggedIn = !!localStorage.getItem('token');
          this.role = localStorage.getItem('role');
          this.sectorName = localStorage.getItem('sector');
        }
      });
    }
  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('token');
      this.role = localStorage.getItem('role');
      this.sectorName = localStorage.getItem('sector');
    }
    this.carregarTabelasSetor();
    this.carregarHistoricoSetor();
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('roleName');
      localStorage.removeItem('sectorName');
      window.location.href = '/login';
    }
  }
  carregarTabelasSetor() {
    this.userTableService.getTablesBySector().subscribe({
      next: (data: any[]) => {
        this.tabelasSetor = data.map(t => {
          let count = 0;
          if (typeof t.columnsStructure === 'object' && t.columnsStructure !== null) {
            const colsStruct = t.columnsStructure as { colunas: string[], itens: any[] };
            count = Array.isArray(colsStruct.itens) ? colsStruct.itens.length : 0;
          }
          return { ...t, itemCount: count };
        });
        this.totalItensSetor = this.tabelasSetor.reduce((acc, t) => acc + (t.itemCount || 0), 0);
      },
      error: err => console.error('Erro ao carregar tabelas do setor', err)
    });
  }
  carregarHistoricoSetor() {
    this.userTableService.getHistoricoPorSetor().subscribe({
      next: (data: Historico[]) => {
        this.historicoSetor = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.temQuantidade = data.length;
        console.log('Quantidade de itens:', this.temQuantidade);
        if (this.historicoSetor.length > 0) {
          const ultimaData = new Date(this.historicoSetor[0].createdAt);
          this.ultimaAtualizacao = `${ultimaData.getDate().toString().padStart(2, '0')}/${
            (ultimaData.getMonth() + 1).toString().padStart(2, '0')
          }/${ultimaData.getFullYear()}`;
        }
      },
      error: (err: any) => console.error('Erro ao carregar histórico do setor', err)
    });
  }
}
