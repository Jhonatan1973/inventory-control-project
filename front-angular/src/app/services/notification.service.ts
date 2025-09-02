import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.local';

export interface Notificacao {
  id?: number;
  titulo: string;
  mensagem: string;
  dataCriacao: string;
  lida: boolean;
  sectorId: number;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiBase = environment.apiUrl + '/notifications';

  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  getNotificacoesPorSetor(sectorId: number): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(
      `${this.apiBase}/sector/${sectorId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  marcarComoLida(id: number): Observable<Notificacao> {
    return this.http.put<Notificacao>(
      `${this.apiBase}/read/${id}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  deletarTodasNotificacoesDoSetor(sectorId: number) {
    return this.http.delete(
      `${this.apiBase}/sector/${sectorId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  criarNotificacao(notificacao: Notificacao): Observable<Notificacao> {
    return this.http.post<Notificacao>(
      this.apiBase,
      notificacao,
      { headers: this.getAuthHeaders() }
    );
  }
}
