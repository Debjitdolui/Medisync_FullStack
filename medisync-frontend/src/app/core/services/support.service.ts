import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupportTicket, TicketDetail, CreateTicketRequest, SupportAgent } from '../models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── TICKETS ────────────────────────────────────────────────────────────────

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${this.apiUrl}/support/tickets/my`).pipe(
      map(res => res.content || res)
    );
  }

  getAssignedTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${this.apiUrl}/support/tickets/assigned`).pipe(
      map(res => res.content || res)
    );
  }

  getAllTickets(params?: { status?: string; category?: string; priority?: string; page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.priority) httpParams = httpParams.set('priority', params.priority);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/support/tickets`, { params: httpParams });
  }

  getTicketById(id: number): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.apiUrl}/support/tickets/${id}`);
  }

  createTicket(request: CreateTicketRequest): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.apiUrl}/support/tickets`, request);
  }

  addMessage(ticketId: number, request: { message: string; isInternal?: boolean }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/support/tickets/${ticketId}/messages`, request);
  }

  assignTicket(ticketId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/support/tickets/${ticketId}/assign`, {});
  }

  escalateTicket(ticketId: number, reason: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/support/tickets/${ticketId}/escalate`, { reason });
  }

  updateStatus(ticketId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/support/tickets/${ticketId}/status`, { status });
  }

  // ─── ADMIN ─────────────────────────────────────────────────────────────────

  getEscalatedTickets(): Observable<SupportTicket[]> {
    return this.http.get<any>(`${this.apiUrl}/admin/escalated-tickets`).pipe(
      map(res => res.content || res)
    );
  }

  getSupportAgents(): Observable<SupportAgent[]> {
    return this.http.get<SupportAgent[]>(`${this.apiUrl}/admin/support-agents`);
  }

  createSupportAgent(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/support-agents`, data);
  }

  blockAgent(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/support-agents/${id}/block`, {});
  }

  unblockAgent(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/support-agents/${id}/unblock`, {});
  }
}
