import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { CommonModule } from '@angular/common';
import { UserTableService } from '../../services/user-table.service'; // caminho correto

interface Coluna {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [TopbarComponent, MenuDesktopComponent, FormsModule, CommonModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent {
  mostrarModal = false;
  nomeTabela = '';
  descricaoTabela = '';
  colunas: Coluna[] = [
    { nome: 'Nome', tipo: 'texto', obrigatorio: true },
    { nome: 'Quantidade', tipo: 'número', obrigatorio: true }
  ];

  constructor(private userTableService: UserTableService) {}
tabelasSetor: any[] = [];

ngOnInit() {
  this.carregarTabelasSetor();
}

carregarTabelasSetor() {
  this.userTableService.getTablesBySector().subscribe({
    next: (data) => {
      this.tabelasSetor = data;
    },
    error: (err) => {
      console.error('Erro ao carregar tabelas do setor', err);
    }
  });
}

  abrirModal() {
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
    this.nomeTabela = '';
    this.descricaoTabela = '';
    this.colunas = [
      { nome: 'Nome', tipo: 'texto', obrigatorio: true },
      { nome: 'Quantidade', tipo: 'número', obrigatorio: true }
    ];
  }

  adicionarColuna() {
    this.colunas.push({ nome: '', tipo: 'texto', obrigatorio: false });
  }

  removerColuna(index: number) {
    this.colunas.splice(index, 1);
  }

  confirmarCriacao() {
    const nomesColunas = this.colunas.map(c => c.nome.trim()).filter(n => n.length > 0);

    if (!this.nomeTabela.trim()) {
      alert('Informe o nome da tabela');
      return;
    }
    if (nomesColunas.length === 0) {
      alert('Adicione pelo menos uma coluna com nome válido');
      return;
    }

    const payload = {
      tableName: this.nomeTabela.trim(),
      description: this.descricaoTabela.trim(),
      columnsJson: JSON.stringify(nomesColunas)
    };

    this.userTableService.createUserTable(payload).subscribe({
      next: () => {
        alert('Tabela criada com sucesso!');
        this.carregarTabelasSetor();
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao criar tabela', err);
        alert('Erro ao criar tabela, veja o console para detalhes.');
      }
    });
  }

  isFormValid(): boolean {
    if (!this.nomeTabela.trim()) return false;
    if (this.colunas.length === 0) return false;
    for (let col of this.colunas) {
      if (!col.nome.trim()) return false;
    }
    return true;
  }

}
