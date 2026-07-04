import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models';
import { MOCK_NOTIFICATIONS } from '../mock/mock-data';

/**
 * NotificationService
 *
 * TO SWITCH TO REAL API:
 *   1. Remove `of(MOCK_NOTIFICATIONS)` mock returns
 *   2. Uncomment the `this.http.get/put(...)` lines
 *   3. Remove MOCK_NOTIFICATIONS import
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Local copy of notifications for mock manipulation
  private mockNotifications = [...MOCK_NOTIFICATIONS];

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    // TODO: return this.http.get<Notification[]>(this.apiUrl).pipe(
    //   tap(notifications => {
    //     const unread = notifications.filter(n => !n.isRead).length;
    //     this.unreadCountSubject.next(unread);
    //   })
    // );

    const unread = this.mockNotifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
    return of([...this.mockNotifications]).pipe(delay(200));
  }

  markAsRead(id: number): Observable<Notification> {
    // TODO: return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {});

    const notif = this.mockNotifications.find(n => n.notificationId === id);
    if (notif) notif.isRead = true;
    this.unreadCountSubject.next(this.mockNotifications.filter(n => !n.isRead).length);
    return of(notif as Notification).pipe(delay(100));
  }

  markAllAsRead(): Observable<any> {
    // TODO: return this.http.put(`${this.apiUrl}/read-all`, {});

    this.mockNotifications.forEach(n => n.isRead = true);
    this.unreadCountSubject.next(0);
    return of({ message: 'All notifications marked as read' }).pipe(delay(100));
  }

  refreshUnreadCount(): void {
    this.getNotifications().subscribe();
  }
}
