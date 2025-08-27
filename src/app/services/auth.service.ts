import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthToken, LoginCredentials } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/auth';
  private readonly tokenKey = 'access_token';
  
  isAuthenticated = signal(this.hasValidToken());
  
  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthToken> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return this.http.post<AuthToken>(`${this.baseUrl}/token`, formData).pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token.access_token);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasValidToken(): boolean {
    return !!this.getToken();
  }
}