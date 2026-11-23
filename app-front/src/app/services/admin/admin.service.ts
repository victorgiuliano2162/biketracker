import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  role: 'USER' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly base = '/api/admin/users';

  constructor(private http: HttpClient) {}

  listUsers(): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(this.base);
  }

  toggleActive(userId: string): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(
      `${this.base}/${userId}/toggle-active`,
      {},
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${userId}`);
  }
}
