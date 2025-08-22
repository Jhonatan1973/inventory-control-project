import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../interfaces/auth/login-response';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrlAuth = `${environment.apiUrl}${environment.endpoints.auth}`;

  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {
    return this.http.post<LoginResponse>(this.apiUrlAuth, { email, password: senha });
  }
}
