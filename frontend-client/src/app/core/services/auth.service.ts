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

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
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
    const body = error.error;

    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = body?.message || 'Email ou mot de passe incorrect';
    } else if (error.status === 409) {
      errorMessage = body?.message || 'Cet email est déjà utilisé';
    } else if (error.status === 400) {
      // Prefer field-level errors (backend sends fieldErrors array)
      if (body?.fieldErrors?.length) {
        errorMessage = (body.fieldErrors as { field: string; message: string }[])
          .map(fe => `${fe.field}: ${fe.message}`)
          .join(' · ');
      } else {
        errorMessage = body?.message || 'Données invalides';
      }
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Réessayez plus tard.';
    } else if (body?.message) {
      errorMessage = body.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      fieldErrors: body?.fieldErrors,
      errors: body?.errors,
    }));
  };
}
