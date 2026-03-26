import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../classes/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {


  private readonly apiUrl = '/api/user';
 
  constructor(private http: HttpClient) { }
 
 
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
