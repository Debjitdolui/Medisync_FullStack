import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboard, AdminActivityLog, AdminReport } from '../../../core/models';

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
  totalPending = 0;

  // Chart data
  platformSegments: { name: string; count: number; color: string; dashArray: string; dashOffset: number }[] = [];
  statusBars: { name: string; count: number; percent: number; color: string }[] = [];
  totalEntities = 0;

  private chartColors = { users: '#1a73e8', pharmacies: '#16a34a', nurses: '#0891b2' };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe(data => {
      this.dashboard = data;
      this.totalPending = (data.pendingPharmacies || 0) + this.pendingNurseCount;
      this.buildCharts(data);
    });
    this.adminService.getLogs().subscribe(page => { this.recentLogs = page.content.slice(0, 5); });
    this.adminService.getReports().subscribe(report => {
      this.pendingNurseCount = report.pendingNurses || 0;
      this.totalPending = (this.dashboard?.pendingPharmacies || 0) + this.pendingNurseCount;
      this.buildStatusBars(report);
    });
  }

  private buildCharts(data: AdminDashboard): void {
    const segments = [
      { name: 'Users', count: data.totalUsers || 0, color: this.chartColors.users },
      { name: 'Pharmacies', count: data.totalPharmacies || 0, color: this.chartColors.pharmacies },
      { name: 'Nurses', count: data.totalNurses || 0, color: this.chartColors.nurses }
    ];

    this.totalEntities = segments.reduce((sum, s) => sum + s.count, 0);
    const circumference = 2 * Math.PI * 60;
    let offset = 0;

    this.platformSegments = segments.map(seg => {
      const percent = this.totalEntities > 0 ? seg.count / this.totalEntities : 0;
      const dashLength = percent * circumference;
      const result = {
        ...seg,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: -offset
      };
      offset += dashLength;
      return result;
    });
  }

  private buildStatusBars(report: AdminReport): void {
    const bars = [
      { name: 'Approved Pharmacies', count: report.approvedPharmacies || 0, color: '#16a34a' },
      { name: 'Pending Pharmacies', count: report.pendingPharmacies || 0, color: '#d97706' },
      { name: 'Rejected Pharmacies', count: report.rejectedPharmacies || 0, color: '#dc2626' },
      { name: 'Approved Nurses', count: report.approvedNurses || 0, color: '#0891b2' },
      { name: 'Pending Nurses', count: report.pendingNurses || 0, color: '#7c3aed' }
    ];

    const maxCount = Math.max(...bars.map(b => b.count), 1);
    this.statusBars = bars.map(b => ({
      ...b,
      percent: (b.count / maxCount) * 100
    }));
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
