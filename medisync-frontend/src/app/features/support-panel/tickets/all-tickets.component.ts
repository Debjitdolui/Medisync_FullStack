import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../core/services/support.service';
import { SupportTicket } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-all-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './all-tickets.component.html',
  styleUrl: './all-tickets.component.scss'
})
export class AllTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  loading = true;
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;

  // Filters
  statusFilter = '';
  categoryFilter = '';
  priorityFilter = '';

  // Route data
  myOnly = false;
  escalatedOnly = false;

  pageTitle = 'All Tickets';

  statuses = ['', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
  categories = ['', 'ACCOUNT', 'BOOKING', 'PAYMENT', 'TECHNICAL', 'OTHER'];
  priorities = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  constructor(
    private supportService: SupportService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.myOnly = !!data['myOnly'];
      this.escalatedOnly = !!data['escalatedOnly'];

      if (this.myOnly) {
        this.pageTitle = 'My Tickets';
      } else if (this.escalatedOnly) {
        this.pageTitle = 'Escalated Tickets';
        this.statusFilter = 'ESCALATED';
      }

      this.loadTickets();
    });
  }

  loadTickets(): void {
    this.loading = true;

    if (this.myOnly) {
      // Support agent's "My Tickets" = tickets assigned to them
      this.supportService.getAssignedTickets().subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.totalItems = tickets.length;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    } else {
      const params: any = {
        page: this.currentPage - 1,
        size: this.pageSize
      };
      if (this.statusFilter) params.status = this.statusFilter;
      if (this.categoryFilter) params.category = this.categoryFilter;
      if (this.priorityFilter) params.priority = this.priorityFilter;

      this.supportService.getAllTickets(params).subscribe({
        next: (res) => {
          this.tickets = res.content || res || [];
          this.totalItems = res.totalElements || this.tickets.length;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadTickets();
  }

  viewTicket(ticketId: number): void {
    this.router.navigate(['/support/tickets', ticketId]);
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
