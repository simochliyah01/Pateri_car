import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  unreadCount = signal(0);

  list(limit = 20): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.apiUrl}?limit=${limit}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  refreshUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (data) => this.unreadCount.set(data.count),
      error: () => {},
    });
  }
}
