import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoInTable } from '../interfaces/product-in-table';

export interface CreateUserTableRequest {
  tableName: string;
  description: string;
  columnsJson: string;
}
export interface ProductBase {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserTableService {
  private API_URL_CREATE = 'http://localhost:9090/api/user-tables/create';
  private API_URL_BY_SECTOR = 'http://localhost:9090/api/user-tables/by-sector';

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
  const url = 'http://localhost:9090/api/products-base';
  return this.http.get<ProductBase[]>(url, { headers: this.getAuthHeaders() });
  }
  salvarProdutosNaTabela(tabelaId: number, produtos: ProdutoInTable[]): Observable<any> {
    const url = `http://localhost:9090/api/user-tables/${tabelaId}/produtos`;
    return this.http.post(url, produtos, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
}

