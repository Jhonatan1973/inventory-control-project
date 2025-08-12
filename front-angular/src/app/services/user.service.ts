import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export interface User {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  sectorId?: number;  
  sectorName: string;
  roleName: string;
  lastModified?: string;
  online?: boolean;
  confirmed?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:9090/api/users';
  private AUTH_URL = 'http://localhost:9090/api/auth';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.AUTH_URL}/login`, { email, password });
  }
  logout(): Observable<string> {
    return this.http.post<string>(`${this.AUTH_URL}/logout`, {}, { headers: this.getAuthHeaders() });
  }
  createUser(user: Partial<User>): Observable<User> {
    const payload = {
      username: user.username,
      email: user.email,
      password: user.password,
      roleId: user.roleId,
      sectorId: user.sectorId || null,
    };
    return this.http.post<User>(this.API_URL, payload, { headers: this.getAuthHeaders() });
  }
sendVerificationCode(email: string): Observable<any> {
  return this.http.post<any>(`${this.AUTH_URL}/sendVerificationCode`, { email });
}

verifyCode(email: string, token: string): Observable<any> {
  return this.http.post<any>(`${this.AUTH_URL}/verifyCode`, { email, token });
}

confirmUser(email: string, token: string): Observable<any> {
  return this.http.post<any>(`${this.AUTH_URL}/confirmUser`, { email, token });
}

  // Atualizar usuário (PUT /users/{id})
  updateUser(user: User): Observable<User> {
    if (!user.id) throw new Error('User id is required for update');
    return this.http.put<User>(`${this.API_URL}/${user.id}`, user, { headers: this.getAuthHeaders() });
  }

  // Listar usuários do mesmo setor (GET /users com token)
  getUsersBySector(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL, { headers: this.getAuthHeaders() });
  }
  deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getAuthHeaders() });
}

}
