import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoInTable } from '../interfaces/user-table/product-in-table';
import { CreateUserTableRequest } from '../interfaces/user-table/create-user-table-request';
import { ProductBase } from '../interfaces/user-table/product-base';
import { Historico } from '../interfaces/user-table/historico';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class UserTableService {
  private apiBase = environment.apiUrl;
  private endpoints = environment.endpoints;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createUserTable(data: CreateUserTableRequest): Observable<any> {
    return this.http.post(`${this.apiBase}${this.endpoints.createUserTable}`, data, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  getTablesBySector(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}${this.endpoints.bySector}`, { headers: this.getAuthHeaders() });
  }

  getProductsBase(): Observable<ProductBase[]> {
    return this.http.get<ProductBase[]>(`${this.apiBase}${this.endpoints.productsBase}`, { headers: this.getAuthHeaders() });
  }

  deleteUserTable(tableId: number): Observable<any> {
    return this.http.delete(`${this.apiBase}${this.endpoints.userTables}/${tableId}`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  adicionarProdutoNovo(tabelaId: number, produto: ProdutoInTable): Observable<any> {
    return this.http.post(`${this.apiBase}${this.endpoints.userTables}/${tabelaId}/produtos/novo`, produto, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  atualizarQuantidadeProdutos(
    tabelaId: number,
    produtoId: number,
    delta: number,
    acao: 'adicionar' | 'diminuir',
    fornecedor?: string,
    valorProduto?: number
  ): Observable<any> {
    return this.http.put(`${this.apiBase}${this.endpoints.userTables}/${tabelaId}/produtos/${produtoId}/quantidade`,
      { delta, acao, fornecedor, valorProduto },
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  getHistoricoPorSetor(): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${this.apiBase}${this.endpoints.historico}`, { headers: this.getAuthHeaders() });
  }
}
