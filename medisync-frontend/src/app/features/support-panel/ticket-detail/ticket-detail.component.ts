import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../core/services/support.service';
import { AuthService } from '../../../core/services/auth.service';
import { SupportTicket, TicketMessage } from '../../../core/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss'
})
export class TicketDetailComponent implements OnInit {
  ticket: SupportTicket | null = null;
  messages: TicketMessage[] = [];
  loading = true;
  ticketId = 0;

  // Message input
  newMessage = '';
  isInternal = false;
  sendingMessage = false;

  // Escalation modal
  showEscalateModal = false;
  escalationReason = '';
  escalating = false;

  // Status dropdown
  showStatusDropdown = false;
  allStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  currentUserName = '';

  constructor(
    private supportService: SupportService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.getUserName() || '';
    this.route.params.subscribe(params => {
      this.ticketId = +params['id'];
      this.loadTicket();
    });
  }

  loadTicket(): void {
    this.loading = true;
    this.supportService.getTicketById(this.ticketId).subscribe({
      next: (detail) => {
        // Backend returns flat TicketDetailResponse with messages array
        this.ticket = detail as any;
        this.messages = detail.messages || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.sendingMessage = true;
    this.supportService.addMessage(this.ticketId, {
      message: this.newMessage.trim(),
      isInternal: this.isInternal
    }).subscribe({
      next: () => {
        this.newMessage = '';
        this.isInternal = false;
        this.sendingMessage = false;
        this.loadTicket();
      },
      error: () => {
        this.sendingMessage = false;
      }
    });
  }

  assignToMe(): void {
    this.supportService.assignTicket(this.ticketId).subscribe({
      next: () => this.loadTicket()
    });
  }

  changeStatus(status: string): void {
    this.showStatusDropdown = false;
    this.supportService.updateStatus(this.ticketId, status).subscribe({
      next: () => this.loadTicket()
    });
  }

  openEscalateModal(): void {
    this.showEscalateModal = true;
    this.escalationReason = '';
  }

  closeEscalateModal(): void {
    this.showEscalateModal = false;
    this.escalationReason = '';
  }

  confirmEscalate(): void {
    if (!this.escalationReason.trim()) return;
    this.escalating = true;
    this.supportService.escalateTicket(this.ticketId, this.escalationReason.trim()).subscribe({
      next: () => {
        this.escalating = false;
        this.closeEscalateModal();
        this.loadTicket();
      },
      error: () => {
        this.escalating = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/support/tickets']);
  }

  isAgentMessage(msg: TicketMessage): boolean {
    const role = (msg.senderRole || '').toUpperCase();
    return role === 'SUPPORT_AGENT' || role === 'ADMIN';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'ASSIGNED': return 'status-assigned';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'ESCALATED': return 'status-escalated';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'LOW': return 'priority-low';
      case 'MEDIUM': return 'priority-medium';
      case 'HIGH': return 'priority-high';
      case 'CRITICAL': return 'priority-critical';
      default: return '';
    }
  }
}
