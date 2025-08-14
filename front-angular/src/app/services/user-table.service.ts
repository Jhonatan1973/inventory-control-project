import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoInTable } from '../interfaces/user-table/product-in-table';
import { CreateUserTableRequest } from '../interfaces/user-table/create-user-table-request';
import { ProductBase } from '../interfaces/user-table/product-base';

@Injectable({
  providedIn: 'root',
})
export class UserTableService {
  private API_URL_CREATE = 'http://localhost:9090/api/user-tables/create';
  private API_URL_BY_SECTOR = 'http://localhost:9090/api/user-tables/by-sector';
  private API_URL_GET_PRODBASE = 'http://localhost:9090/api/products-base';

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
  salvarProdutosNaTabela(tabelaId: number, produtos: ProdutoInTable[]): Observable<any> {
    const url = `http://localhost:9090/api/user-tables/${tabelaId}/produtos`;
    return this.http.post(url, produtos, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
}

