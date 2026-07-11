import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SupportService } from '../../../core/services/support.service';
import { SupportTicket, TicketDetail, CreateTicketRequest } from '../../../core/models/support.model';

@Component({
  selector: 'app-pharmacy-help-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pharmacy-help-support.component.html',
  styleUrl: './pharmacy-help-support.component.scss'
})
export class PharmacyHelpSupportComponent implements OnInit {
  // Form fields
  subject = '';
  description = '';
  category = '';
  priority = '';

  categories = ['ACCOUNT', 'BOOKING', 'PAYMENT', 'TECHNICAL', 'OTHER'];
  priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Tickets
  tickets: SupportTicket[] = [];
  expandedTicketId: number | null = null;
  ticketDetail: TicketDetail | null = null;
  replyMessage = '';
  isSubmitting = false;
  isReplying = false;
  isLoading = false;

  constructor(
    private supportService: SupportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.supportService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load tickets', 'Error');
        this.isLoading = false;
      }
    });
  }

  submitTicket(): void {
    if (!this.subject.trim() || !this.description.trim() || !this.category || !this.priority) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    this.isSubmitting = true;
    const request: CreateTicketRequest = {
      subject: this.subject,
      description: this.description,
      category: this.category,
      priority: this.priority
    };

    this.supportService.createTicket(request).subscribe({
      next: () => {
        this.toastr.success('Ticket created successfully', 'Success');
        this.subject = '';
        this.description = '';
        this.category = '';
        this.priority = '';
        this.isSubmitting = false;
        this.loadTickets();
      },
      error: () => {
        this.toastr.error('Failed to create ticket', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  toggleTicket(ticketId: number): void {
    if (this.expandedTicketId === ticketId) {
      this.expandedTicketId = null;
      this.ticketDetail = null;
      return;
    }

    this.expandedTicketId = ticketId;
    this.ticketDetail = null;
    this.replyMessage = '';
    this.supportService.getTicketById(ticketId).subscribe({
      next: (detail) => {
        this.ticketDetail = detail;
      },
      error: () => {
        this.toastr.error('Failed to load ticket details', 'Error');
      }
    });
  }

  sendReply(): void {
    if (!this.replyMessage.trim() || !this.expandedTicketId) return;

    this.isReplying = true;
    this.supportService.addMessage(this.expandedTicketId, { message: this.replyMessage, isInternal: false }).subscribe({
      next: () => {
        this.toastr.success('Reply sent', 'Success');
        this.replyMessage = '';
        this.isReplying = false;
        // Reload ticket detail
        if (this.expandedTicketId) {
          this.supportService.getTicketById(this.expandedTicketId).subscribe(detail => {
            this.ticketDetail = detail;
          });
        }
      },
      error: () => {
        this.toastr.error('Failed to send reply', 'Error');
        this.isReplying = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'open';
      case 'ASSIGNED': return 'assigned';
      case 'IN_PROGRESS': return 'in-progress';
      case 'ESCALATED': return 'escalated';
      case 'RESOLVED': return 'resolved';
      case 'CLOSED': return 'closed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'LOW': return 'low';
      case 'MEDIUM': return 'medium';
      case 'HIGH': return 'high';
      case 'CRITICAL': return 'critical';
      default: return '';
    }
  }
}
