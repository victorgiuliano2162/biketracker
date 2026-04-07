import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';


export interface LoginRequest {
  email: string;
  password: string;
}
 
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = '/api/auth';

  readonly isAuthenticated = signal(this.hasValidToken());

  constructor(private http: HttpClient, private router: Router) {   }

  
  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.isAuthenticated.set(true);
        console.log("Acces Token:", response.accessToken);
      })
    );
  }


    refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return;
    }

      return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
 
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
 
  private hasValidToken(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
 
    try {
      // Decodifica o payload do JWT sem biblioteca externa
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // converte para ms
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

}
