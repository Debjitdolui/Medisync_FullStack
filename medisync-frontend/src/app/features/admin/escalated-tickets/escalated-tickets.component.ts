import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SupportService } from '../../../core/services/support.service';
import { SupportTicket, TicketDetail } from '../../../core/models/support.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-escalated-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './escalated-tickets.component.html',
  styleUrl: './escalated-tickets.component.scss'
})
export class EscalatedTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // View Modal
  showViewModal = false;
  selectedTicket: SupportTicket | null = null;
  ticketDetail: TicketDetail | null = null;
  isResolving = false;

  constructor(
    private supportService: SupportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.supportService.getEscalatedTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load escalated tickets', 'Error');
        this.isLoading = false;
      }
    });
  }

  get paginatedTickets(): SupportTicket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tickets.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  openViewModal(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.ticketDetail = null;
    this.showViewModal = true;

    this.supportService.getTicketById(ticket.ticketId).subscribe({
      next: (detail) => {
        this.ticketDetail = detail;
      },
      error: () => {
        this.toastr.error('Failed to load ticket details', 'Error');
      }
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTicket = null;
    this.ticketDetail = null;
  }

  resolveTicket(): void {
    if (!this.selectedTicket) return;

    this.isResolving = true;
    this.supportService.updateStatus(this.selectedTicket.ticketId, 'RESOLVED').subscribe({
      next: () => {
        this.toastr.success('Ticket resolved successfully', 'Success');
        this.isResolving = false;
        this.closeViewModal();
        this.loadTickets();
      },
      error: () => {
        this.toastr.error('Failed to resolve ticket', 'Error');
        this.isResolving = false;
      }
    });
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
