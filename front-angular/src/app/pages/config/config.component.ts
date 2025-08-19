import { Component } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { MenuDesktopComponent } from '../../components/menu-desktop/menu-desktop.component';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTableService } from '../../services/user-table.service';
import { Tabela, ColumnsStructureObject } from '../stock/stock.component';
import { Historico } from '../../interfaces/user-table/historico';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [MenuDesktopComponent, TopbarComponent, NgIf, NgFor, TitleCasePipe, FormsModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent {
  showModal = false;
  exportType: 'tabelas' | 'historico' = 'tabelas';
  tabelasSetor: Tabela[] = [];
  historicoSetor: Historico[] = [];
  dataInicio: string = '';
  dataFim: string = '';
  constructor(private userTableService: UserTableService) { }
  openModal(type: 'tabelas' | 'historico') {
    this.exportType = type;
    this.showModal = true;
    if (type === 'tabelas') {
      this.carregarTabelasSetor();
    }
  }
  closeModal() {
    this.showModal = false;
  }
  carregarTabelasSetor() {
    this.userTableService.getTablesBySector().subscribe({
      next: data => {
        this.tabelasSetor = data.map(t => {
          let count = 0;
          if (typeof t.columnsStructure === 'object' && t.columnsStructure !== null) {
            const colsStruct = t.columnsStructure as ColumnsStructureObject;
            count = Array.isArray(colsStruct.itens) ? colsStruct.itens.length : 0;
          }
          return { ...t, itemCount: count, selecionado: false };
        });
      },
      error: err => console.error('Erro ao carregar tabelas do setor', err)
    });
  }
  allSelected(): boolean {
    return this.tabelasSetor.every(t => t.selecionado);
  }
  toggleSelecionarTodos(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.tabelasSetor.forEach(t => t.selecionado = checked);
  }
  exportarExcel() {
    const selecionadas = this.tabelasSetor.filter(t => t.selecionado);
    if (selecionadas.length === 0) {
      alert('Selecione pelo menos uma tabela');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    selecionadas.forEach(tabela => {
      const sheet = workbook.addWorksheet(tabela.tableName);
      if (typeof tabela.columnsStructure === 'object' && tabela.columnsStructure !== null) {
        const colsStruct = tabela.columnsStructure as ColumnsStructureObject;
        const headerRow = sheet.addRow(colsStruct.colunas);
        sheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: colsStruct.colunas.length }
        };

        colsStruct.itens.forEach(item => {
          const row = colsStruct.colunas.map(col => {
            switch (col.toLowerCase()) {
              case 'nome': return item.nome || '';
              case 'quantidade': return item.quantidade ?? '';
              case 'validade': return (item.validadeArray && item.validadeArray.length > 0) ? item.validadeArray.join(', ')
                : '';
              default: return '';
            }
          });
          sheet.addRow(row);
        });
      }
    });
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const nomeArquivo = `tabela-${selecionadas[0].tableName}-${dia}-${mes}-${ano}.xlsx`;
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, nomeArquivo);
    });
  }
  carregarHistoricoSetor() {
    this.userTableService.getHistoricoPorSetor().subscribe({
      next: (data: Historico[]) => {
        this.historicoSetor = data
          .filter(h => {
            const created = new Date(h.createdAt);
            const inicio = this.dataInicio ? new Date(this.dataInicio) : null;
            const fim = this.dataFim ? new Date(this.dataFim) : null;
            if (inicio && fim) return created >= inicio && created <= fim;
            if (inicio) return created >= inicio;
            if (fim) return created <= fim;
            return true;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      error: (err: any) => console.error('Erro ao carregar histórico do setor', err)
    });
  }
  get totalEntrada(): number {
    return this.historicoSetor.filter(h => h.acao.toLowerCase() === 'adicionar').length;
  }
  get totalSaida(): number {
    return this.historicoSetor.filter(h => h.acao.toLowerCase() === 'retirada').length;
  }
  exportarHistoricoExcel() {
    if (this.historicoSetor.length === 0) {
      alert('Não há histórico para exportar no período selecionado.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Histórico');
    sheet.addRow(['Ação', 'Delta', 'Data']);
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 3 }
    };
    this.historicoSetor.forEach(h => {
      sheet.addRow([
        h.acao,
        h.delta,
        new Date(h.createdAt).toLocaleDateString('pt-BR')
      ]);
    });
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const nomeArquivo = `historico-${dia}-${mes}-${ano}.xlsx`;
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, nomeArquivo);
    });
  }
  limparFiltro() {
    this.dataInicio = '';
    this.dataFim = '';
    this.historicoSetor = [];
  }
  confirmarExportacao() {
    const selecionadas = this.tabelasSetor.filter(t => t.selecionado);
    console.log('Tabelas selecionadas:', selecionadas);
    this.closeModal();
  }
}