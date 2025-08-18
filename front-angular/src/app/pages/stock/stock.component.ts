import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { ProductBase } from '../../interfaces/user-table/product-base';
import { UserTableService } from '../../services/user-table.service';

export interface ProdutoInTable {
  id: number;
  name: string;
  fields: { [campoNome: string]: any };
  qtdAlterar?: number;
}
export interface ProdutoInTableModal extends ProdutoInTable {
  qtdAlterar: number;
  quantidadeInicial: number;
  selecionado?: boolean;
  novaValidade?: string;
}
export interface Coluna {
  nome: string;
  nomeKey?: string;
  tipo: 'texto' | 'número' | 'data';
  obrigatorio: boolean;
}
export interface ColumnsStructureObject {
  colunas: string[];
  itens: any[];
}
export interface Tabela {
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
  tabelasSetor: Tabela[] = [];
  tabelaSelecionada: Tabela | null = null;

  mostrarModal = false;
  nomeTabela = '';
  descricaoTabela = '';
  colunas: Coluna[] = [
    { nome: 'Nome', tipo: 'texto', obrigatorio: true },
    { nome: 'Quantidade', tipo: 'número', obrigatorio: true },
    { nome: 'Validade', tipo: 'data', obrigatorio: false }
  ];

  itensTabelaSelecionada: ProdutoInTable[] = [];
  modalDetalhesTabelaAberto = false;
  mostrarBotaoAdd = false;

  mostrarSidebarProdutos = false;
  productsBaseList: ProductBase[] = [];
  selectAll = false;
  produtoSelecionado: { [id: number]: boolean } = {};

  modalQuantidadeAberto = false;
  acao: 'escolher' | 'adicionar' | 'diminuir' = 'adicionar';
  itensTabelaModal: ProdutoInTableModal[] = [];
  filtro = '';

  fornecedorGlobal = '';
  valorProdutoGlobal = 0;

  constructor(private userTableService: UserTableService) {}

  ngOnInit() { this.carregarTabelasSetor(); }
  carregarTabelasSetor() {
    this.userTableService.getTablesBySector().subscribe({
      next: data => this.tabelasSetor = data,
      error: err => console.error('Erro ao carregar tabelas do setor', err)
    });
}
  excluirTabela(tabelaId: number, nomeTabela: string) {
    if (!confirm(`Deseja excluir a tabela "${nomeTabela}"?`)) return;
    this.userTableService.deleteUserTable(tabelaId).subscribe({
      next: () => {
        alert(`Tabela "${nomeTabela}" excluída com sucesso!`);
        this.tabelasSetor = this.tabelasSetor.filter(t => t.id !== tabelaId);
      },
      error: err => { console.error('Erro ao excluir tabela:', err); alert('Erro ao excluir tabela.'); }
    });
  }
  abrirModal() { this.mostrarModal = true; }
  fecharModal() {
    this.mostrarModal = false;
    this.nomeTabela = '';
    this.descricaoTabela = '';
    this.colunas = [
      { nome: 'Nome', tipo: 'texto', obrigatorio: true },
      { nome: 'Quantidade', tipo: 'número', obrigatorio: true },
      { nome: 'Validade', tipo: 'data', obrigatorio: false }
    ];
  }
  adicionarColuna() { this.colunas.push({ nome: '', tipo: 'texto', obrigatorio: false }); }
  removerColuna(index: number) { this.colunas.splice(index, 1); }
  isFormValid(): boolean {
    return this.nomeTabela.trim() !== '' &&
           this.colunas.length > 0 &&
           this.colunas.every(col => col.nome.trim().length > 0);
  }
  confirmarCriacao() {
    const nomesColunas = this.colunas.map(c => c.nome.trim()).filter(n => n.length > 0);
    if (!this.nomeTabela.trim()) { alert('Informe o nome da tabela'); return; }
    if (this.tabelasSetor.some(t => t.tableName.toLowerCase() === this.nomeTabela.toLowerCase())) {
      alert('Já existe uma tabela com esse nome.'); return;
    }
    if (nomesColunas.length === 0) { alert('Adicione pelo menos uma coluna válida'); return; }
    const payload = {
      tableName: this.nomeTabela.trim(),
      description: this.descricaoTabela.trim(),
      columnsJson: JSON.stringify(nomesColunas)
    };
    this.userTableService.createUserTable(payload).subscribe({
      next: () => { alert('Tabela criada com sucesso!'); this.carregarTabelasSetor(); this.fecharModal(); },
      error: err => { console.error('Erro ao criar tabela', err); alert('Erro ao criar tabela.'); }
    });
  }
  abrirModalDetalhesTabela(tabela: Tabela) {
    this.tabelaSelecionada = { ...tabela, colunas: [] };
    this.itensTabelaSelecionada = [];
    try {
      let colunasArray: string[] = [];
      let itensArray: any[] = [];

      if (Array.isArray(tabela.columnsStructure)) colunasArray = tabela.columnsStructure as string[];
      else if (typeof tabela.columnsStructure === 'object' && tabela.columnsStructure !== null) {
        const colsStruct = tabela.columnsStructure as ColumnsStructureObject;
        colunasArray = Array.isArray(colsStruct.colunas) ? colsStruct.colunas : [];
        itensArray = Array.isArray(colsStruct.itens) ? colsStruct.itens : [];
      }
      this.tabelaSelecionada.colunas = colunasArray.map(nome => ({
        nome,
        nomeKey: nome.toLowerCase(),
        tipo: nome.toLowerCase() === 'quantidade' ? 'número' : nome.toLowerCase() === 'validade' ? 'data' : 'texto',
        obrigatorio: false
      }));
      this.itensTabelaSelecionada = itensArray.map(item => {
        const fields: { [key: string]: any } = {};
        this.tabelaSelecionada!.colunas!.forEach(col => {
          const key = col.nomeKey!;
          if (key === 'nome') fields[key] = item.nome;
          else if (key === 'quantidade') fields[key] = item.quantidade ?? 0;
          else if (key === 'validade') fields[key] = item.validadeArray ?? [];
          else fields[key] = item[key] ?? '';
        });
        return { id: item.id, name: item.nome, fields } as ProdutoInTable;
      });
    } catch (e) {
      console.error('Erro ao parsear colunas/itens:', e);
      this.tabelaSelecionada.colunas = [];
      this.itensTabelaSelecionada = [];
    }
    this.modalDetalhesTabelaAberto = true;
    this.mostrarBotaoAdd = false;
  }
  editarTabela() { if (this.tabelaSelecionada) this.mostrarBotaoAdd = true; }
  fecharModalDetalhesTabela(event?: Event) {
    event?.stopPropagation();
    this.modalDetalhesTabelaAberto = false;
    this.tabelaSelecionada = null;
    this.mostrarBotaoAdd = false;
    this.mostrarSidebarProdutos = false;
  }
carregarProductsBase() {
  this.userTableService.getProductsBase().subscribe({
    next: (data) => {
      this.productsBaseList = data;
      this.produtoSelecionado = {};
      this.productsBaseList.forEach(p => this.produtoSelecionado[p.id] = false);
    },
    error: (err) => console.error('Erro ao carregar produtos base:', err)
  });
}
  get itensTabela(): ProdutoInTable[] { return this.itensTabelaSelecionada; }
  get colunasTabelaSelecionada(): Coluna[] { return this.tabelaSelecionada?.colunas || []; }
  selecionarAcao(acaoEscolhida: 'adicionar' | 'diminuir') { this.acao = acaoEscolhida; }
  fecharModalQuantidade() {
    this.modalQuantidadeAberto = false;
    this.acao = 'escolher';
    this.filtro = '';
    this.itensTabelaModal = [];
    this.fornecedorGlobal = '';
    this.valorProdutoGlobal = 0;
    this.selectAll = false;
    this.produtoSelecionado = {};
  }
  filtrarProdutos(): ProdutoInTable[] {
    const filtroLower = this.filtro.toLowerCase();
    return this.itensTabelaSelecionada.filter(item => item.name.toLowerCase().includes(filtroLower));
  }
  atualizarQuantidadeProdutos(produto: ProdutoInTable, delta: number, acao: 'adicionar' | 'diminuir') {
    if (!this.tabelaSelecionada) return;

    this.userTableService.atualizarQuantidadeProdutos(
      this.tabelaSelecionada.id,
      produto.id,
      delta,
      acao,
      this.fornecedorGlobal,
      this.valorProdutoGlobal
    ).subscribe({
      next: () => {
        const atual = Number(produto.fields['quantidade'] ?? 0);
        produto.fields['quantidade'] = acao === 'adicionar' ? atual + delta : Math.max(0, atual - delta);
      },
      error: err => console.error('Erro ao atualizar quantidade', err)
    });
  }
confirmarAlteracao() {
  if (!this.tabelaSelecionada) return;
  this.itensTabelaSelecionada.forEach(item => {
    if (item.qtdAlterar && item.qtdAlterar > 0) {
      const delta = item.qtdAlterar;
      const acao = this.acao === 'adicionar' ? 'adicionar' : 'diminuir';
      this.userTableService.atualizarQuantidadeProdutos(
        this.tabelaSelecionada!.id,
        item.id,
        delta,
        acao,
        this.fornecedorGlobal,
        this.valorProdutoGlobal
      ).subscribe({
        next: () => {
          const atual = Number(item.fields['quantidade'] ?? 0);
          item.fields['quantidade'] = acao === 'adicionar' ? atual + delta : Math.max(0, atual - delta);
          item.qtdAlterar = 0;
        },
        error: (err: any) => console.error('Erro ao atualizar quantidade', err)
      });
    }
  });
  alert(`Quantidade ${this.acao === 'adicionar' ? 'adicionada' : 'reduzida'} com sucesso!`);
  this.fecharModalQuantidade();
}
abrirSidebarProdutos() {
  this.mostrarSidebarProdutos = true;
  this.carregarProductsBase();
}
  abrirModalEscolhaAcao() { this.modalQuantidadeAberto = true; this.acao = 'escolher'; }
  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.productsBaseList.forEach(prod => this.produtoSelecionado[prod.id] = this.selectAll);
  }
confirmarSelecaoProdutos(event?: Event) {
  event?.preventDefault();
  if (!this.tabelaSelecionada) return;
  const produtosSelecionados = this.productsBaseList.filter(p => this.produtoSelecionado[p.id]);
  produtosSelecionados.forEach(produtoBase => {
    const produtoInTable: ProdutoInTable = {
      id: produtoBase.id,
      name: produtoBase.name,
      fields: { quantidade: 0, validade: [] }
    };
    this.userTableService.adicionarProdutoNovo(this.tabelaSelecionada!.id, produtoInTable)
      .subscribe({
        next: () => {
          this.itensTabelaSelecionada.push(produtoInTable);
          this.itensTabelaSelecionada = [...this.itensTabelaSelecionada];
        },
        error: (err) => console.error('Erro ao adicionar produto à tabela', err)
      });
  });
  this.mostrarSidebarProdutos = false;
  this.produtoSelecionado = {};
  this.selectAll = false;
  window.location.reload();
}
  salvarProdutos() {}
  getValidadePrincipal(item: ProdutoInTable): string {
    const validades = item.fields['validade'];
    if (Array.isArray(validades) && validades.length > 0) return validades[0];
    return '-';
  }
  getOutrasValidades(item: ProdutoInTable): string[] {
    const validades = item.fields['validade'];
    if (Array.isArray(validades) && validades.length > 1) return validades.slice(1);
    return [];
  }
  colunaExiste(nomeKey: string): boolean {
    return this.tabelaSelecionada?.colunas?.some(c => c.nomeKey === nomeKey) || false;
  }
}