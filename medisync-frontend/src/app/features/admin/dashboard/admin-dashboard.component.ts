import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboard, AdminActivityLog } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  recentLogs: AdminActivityLog[] = [];
  pendingNurseCount = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe(data => { this.dashboard = data; });
    this.adminService.getLogs().subscribe(logs => { this.recentLogs = logs.slice(0, 5); });
  }

  getLogIcon(action: string): string {
    switch (action) {
      case 'PHARMACY_APPROVED': return 'ti-building-store';
      case 'NURSE_APPROVED': return 'ti-nurse';
      case 'BLOCK_USER': return 'ti-user-off';
      case 'UNBLOCK_USER': return 'ti-user-check';
      default: return 'ti-activity';
    }
  }

  getLogIconClass(action: string): string {
    switch (action) {
      case 'PHARMACY_APPROVED': return 'green';
      case 'NURSE_APPROVED': return 'blue';
      case 'BLOCK_USER': return 'red';
      case 'UNBLOCK_USER': return 'green';
      default: return 'orange';
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours + 'h ago';
    return Math.floor(diffHours / 24) + 'd ago';
  }
}
