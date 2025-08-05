// services/user.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
  sectors: string;
  lastModified: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:9090/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<User[]>(this.API_URL, { headers });
  }

  updateUser(user: User): Observable<User> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<User>(`${this.API_URL}/${user.id}`, user, { headers });
  }

  deleteUser(userId: number): Observable<void> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete<void>(`${this.API_URL}/${userId}`, { headers });
  }
  createUser(user: User): Observable<User> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<User>(this.API_URL, user, { headers });
  }
}
