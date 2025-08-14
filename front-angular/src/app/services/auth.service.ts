import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../interfaces/auth/login-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'http://localhost:9090/api/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {
    return this.http.post<LoginResponse>(this.API_URL, {
      email,
      password: senha 
    });
  }
}