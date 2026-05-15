import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientStatus } from '../models/client.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: ClientStatus): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/status`, { status });
  }

  setBlacklist(id: number, blacklisted: boolean, reason?: string): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/blacklist`, { blacklisted, reason });
  }
}
