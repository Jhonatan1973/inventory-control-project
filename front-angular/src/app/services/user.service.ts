import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInterface } from '../interfaces/user/user-interface';

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
  createUser(user: Partial<UserInterface>): Observable<UserInterface> {
    const payload = {
      username: user.username,
      email: user.email,
      password: user.password,
      roleId: user.roleId,
      sectorId: user.sectorId || null,
    };
    return this.http.post<UserInterface>(this.API_URL, payload, { headers: this.getAuthHeaders() });
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
  updateUser(user: UserInterface): Observable<UserInterface> {
    if (!user.id) throw new Error('User id is required for update');
    return this.http.put<UserInterface>(`${this.API_URL}/${user.id}`, user, { headers: this.getAuthHeaders() });
  }
  getUsersBySector(): Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>(this.API_URL, { headers: this.getAuthHeaders() });
  }
  deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getAuthHeaders() });
}

}
