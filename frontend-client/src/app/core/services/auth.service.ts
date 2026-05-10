import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError } from 'rxjs';
import {
  LoginRequest, RegisterRequest, AuthResponse, AuthUser
} from '../models/auth.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pateri_access_token',
  REFRESH_TOKEN: 'pateri_refresh_token',
  USER: 'pateri_user',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private _currentUser = signal<AuthUser | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => this._currentUser() !== null);

  isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === 'ADMIN' || user?.role === 'GERANT';
  });

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this.persistAuth(response)),
        catchError(this.handleError)
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => this.persistAuth(response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this._currentUser.set(null);
    this.router.navigate(['/home']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(tap(response => this.persistAuth(response)));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private persistAuth(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  private loadUser(): AuthUser | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Une erreur est survenue';

    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
    } else if (error.status === 409) {
      errorMessage = error.error?.message || 'Cet email est déjà utilisé';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Données invalides';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Réessayez plus tard.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      errors: error.error?.errors,
    }));
  };
}
