import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'http://localhost:9090/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {
    return this.http.post<{ token: string }>(this.API_URL, {
      email,
      password: senha // <- 'password' deve ser usado se o backend espera assim
    });
  }
}
