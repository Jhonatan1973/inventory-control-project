import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoInTable } from '../interfaces/user-table/product-in-table';
import { CreateUserTableRequest } from '../interfaces/user-table/create-user-table-request';
import { ProductBase } from '../interfaces/user-table/product-base';
import { Historico } from '../interfaces/user-table/historico';

@Injectable({
  providedIn: 'root',
})
export class UserTableService {
  private API_URL_CREATE = 'http://localhost:9090/api/user-tables/create';
  private API_URL_BY_SECTOR = 'http://localhost:9090/api/user-tables/by-sector';
  private API_URL_GET_PRODBASE = 'http://localhost:9090/api/products-base';
  private API_URL_DEL_TABLE = 'http://localhost:9090/api/user-tables';
  private API_URL_HISTORICO = 'http://localhost:9090/api/user-tables'; 

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  createUserTable(data: CreateUserTableRequest): Observable<any> {
    return this.http.post(this.API_URL_CREATE, data, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
  getTablesBySector(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL_BY_SECTOR, { headers: this.getAuthHeaders() });
  }
  getProductsBase(): Observable<ProductBase[]> {
    return this.http.get<ProductBase[]>(this.API_URL_GET_PRODBASE, { headers: this.getAuthHeaders() });
  }
  deleteUserTable(tableId: number): Observable<any> {
    return this.http.delete(`${this.API_URL_DEL_TABLE}/${tableId}`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
  adicionarProdutoNovo(tabelaId: number, produto: ProdutoInTable): Observable<any> {
    const url = `${this.API_URL_DEL_TABLE}/${tabelaId}/produtos/novo`;
    return this.http.post(url, produto, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
  atualizarQuantidadeProdutos(
    tabelaId: number,
    produtoId: number,
    delta: number,
    acao: 'adicionar' | 'diminuir',
    fornecedor?: string,
    valorProduto?: number
  ): Observable<any> {
    const url = `${this.API_URL_DEL_TABLE}/${tabelaId}/produtos/${produtoId}/quantidade`;
    return this.http.put(url, { delta, acao, fornecedor, valorProduto }, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
  getHistoricoPorSetor(): Observable<Historico[]> {
    const url = `${this.API_URL_HISTORICO}/historico/by-sector`;
    return this.http.get<Historico[]>(url, { headers: this.getAuthHeaders() });
  }
}