import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(pageRequest?: PageRequest): Observable<Page<Notification>> {
    const pr = pageRequest || { page: 0, size: 20, sort: 'createdAt,desc' };
    let params = new HttpParams()
      .set('page', pr.page.toString())
      .set('size', pr.size.toString());
    if (pr.sort) params = params.set('sort', pr.sort);

    return this.http.get<Page<Notification>>(this.apiUrl, { params }).pipe(
      tap(page => {
        const unread = page.content.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unread);
      })
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  refreshUnreadCount(): void {
    this.getNotifications({ page: 0, size: 100 }).subscribe();
  }
}
