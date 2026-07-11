import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportService } from '../../../core/services/support.service';
import { SupportTicket } from '../../../core/models';

@Component({
  selector: 'app-support-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support-dashboard.component.html',
  styleUrl: './support-dashboard.component.scss'
})
export class SupportDashboardComponent implements OnInit {
  openCount = 0;
  assignedToMeCount = 0;
  escalatedCount = 0;
  resolvedTodayCount = 0;
  recentTickets: SupportTicket[] = [];
  loading = true;

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.supportService.getAllTickets({ page: 0, size: 50 }).subscribe({
      next: (res) => {
        const tickets: SupportTicket[] = res.content || res || [];
        this.openCount = tickets.filter(t => t.status === 'OPEN').length;
        this.assignedToMeCount = tickets.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
        this.escalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;

        const today = new Date().toISOString().split('T')[0];
        this.resolvedTodayCount = tickets.filter(t =>
          t.status === 'RESOLVED' && t.updatedAt && t.updatedAt.startsWith(today)
        ).length;

        this.recentTickets = tickets.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
