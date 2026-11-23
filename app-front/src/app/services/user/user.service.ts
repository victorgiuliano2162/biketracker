import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoSanguineoType, User } from '../../models/user.model';

export interface UpdateUserPayload {
  name: string;
  email: string;
  age: number;
  weight: number;
  bornAt: string;
  tipoSanguineo: TipoSanguineoType | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = '/api/user';

  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateMe(payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, payload);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  patch(id: number, partial: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, partial);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
