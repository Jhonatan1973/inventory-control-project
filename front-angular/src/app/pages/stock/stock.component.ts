import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { CommonModule } from '@angular/common';
import { ProdutoInTable } from '../../interfaces/user-table/product-in-table';
import { ProductBase } from '../../interfaces/user-table/product-base';
import { UserTableService } from '../../services/user-table.service';

interface Coluna {
  nome: string;
  nomeKey?: string;
  tipo: string;
  obrigatorio: boolean;
}
interface ColumnsStructureObject {
  colunas: string[];
  itens: any[];
}
interface Tabela {
  id: number;
  tableName: string;
  description: string;
  itemCount: number;
  columnsStructure: string | ColumnsStructureObject;
  colunas?: Coluna[];
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [TopbarComponent, MenuDesktopComponent, FormsModule, CommonModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent {
  itensTabelaSelecionada: ProdutoInTable[] = [];
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
 tabelaSelecionada: Tabela | null = null;
  modalDetalhesTabelaAberto = false;
abrirModalDetalhesTabela(tabela: Tabela) {
  this.tabelaSelecionada = { ...tabela, colunas: [] };
  this.itensTabelaSelecionada = [];
  try {
    let colunasArray: string[] = [];
    if (Array.isArray(tabela.columnsStructure)) {
      colunasArray = tabela.columnsStructure as string[];
    } else if (typeof tabela.columnsStructure === 'object' && tabela.columnsStructure !== null) {
      if (Array.isArray(tabela.columnsStructure.colunas)) {
        colunasArray = tabela.columnsStructure.colunas;
      }
      if (Array.isArray(tabela.columnsStructure.itens)) {
        this.itensTabelaSelecionada = tabela.columnsStructure.itens.map(item => ({
          id: item.id,
          name: item.nome,
          fields: item.campos ?? {}
        }));
      }
    }
    this.tabelaSelecionada.colunas = colunasArray.map(nome => ({
      nome,
      nomeKey: nome.toLowerCase(), 
      tipo: 'texto',
      obrigatorio: false
    }));
  } catch (e) {
    console.error('Erro ao parsear colunas:', e);
    this.tabelaSelecionada.colunas = [];
    this.itensTabelaSelecionada = [];
  }
  this.modalDetalhesTabelaAberto = true;
}
get colunasTabelaSelecionada(): Coluna[] {
  return this.tabelaSelecionada?.colunas ?? [];
}
get itensTabela(): ProdutoInTable[] {
  return this.itensTabelaSelecionada ?? [];
}
  mostrarBotaoAdd = false;
  mostrarSidebarProdutos = false;
  productsBaseList: ProductBase[] = [];
  produtoSelecionado: { [id: number]: boolean } = {};
  editarTabela() {
    if (!this.tabelaSelecionada) return;
    this.mostrarBotaoAdd = true;
  }
  abrirSidebarProdutos() {
    this.userTableService.getProductsBase().subscribe({
      next: (produtos) => {
        this.productsBaseList = produtos;
        this.produtoSelecionado = {};
        this.mostrarSidebarProdutos = true;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos base', err);
      }
    });
  }
confirmarSelecaoProdutos() {
  const selecionados = this.productsBaseList.filter(p => this.produtoSelecionado[p.id]);
  selecionados.forEach(produto => {
    const existe = this.itensTabelaSelecionada.some(item => item.id === produto.id);
    if (!existe) {
      const camposIniciais: { [key: string]: any } = {};
      if (this.tabelaSelecionada?.colunas) {
        this.tabelaSelecionada?.colunas.forEach(coluna => {
          const key = coluna.nomeKey ?? coluna.nome;

          switch (key.toLowerCase()) {
            case 'nome':
              camposIniciais[key] = produto.name;
              break;
            case 'quantidade':
              camposIniciais[key] = 0;
              break;
            case 'validade':
              camposIniciais[key] = '12/09/2025';
              break;
            default:
              camposIniciais[key] = '';
          }
        });
      }
      this.itensTabelaSelecionada.push({
        id: produto.id,
        name: produto.name,
        fields: camposIniciais
      });
    }
  });
  this.mostrarSidebarProdutos = false;
}
salvarProdutos() {
  if (!this.tabelaSelecionada) return;
  this.userTableService.salvarProdutosNaTabela(this.tabelaSelecionada.id, this.itensTabelaSelecionada)
    .subscribe({
      next: () => alert('Produtos salvos com sucesso!'),
      error: err => console.error('Erro ao salvar produtos', err)
    });
}
  fecharModalDetalhesTabela(event?: Event) {
    if (event) event.stopPropagation();
    this.modalDetalhesTabelaAberto = false;
    this.tabelaSelecionada = null;
    this.mostrarBotaoAdd = false;
    this.mostrarSidebarProdutos = false;
  }
}