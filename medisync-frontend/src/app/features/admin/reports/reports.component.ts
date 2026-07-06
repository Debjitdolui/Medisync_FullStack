import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AdminReport } from '../../../core/models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  report: AdminReport | null = null;
  isDownloading = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getReports().subscribe(data => { this.report = data; });
  }

  getPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  downloadUsersReport(): void {
    this.isDownloading = 'users';
    this.adminService.getUsersReportData().subscribe({
      next: (data) => {
        const headers = ['User ID', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Total Bookings', 'Registered On'];
        const rows = data.map(d => [
          d.userId, d.username, d.email, d.phone || '-', d.role, d.status, d.totalBookings, d.registeredOn?.split('T')[0] || ''
        ]);
        this.exportToExcel('Users_Report', headers, rows);
        this.isDownloading = '';
      },
      error: () => { this.isDownloading = ''; }
    });
  }

  downloadPharmaciesReport(): void {
    this.isDownloading = 'pharmacies';
    this.adminService.getPharmaciesReportData().subscribe({
      next: (data) => {
        const headers = ['Pharmacy ID', 'Pharmacy Name', 'Owner', 'Email', 'City', 'Phone', 'Status', 'Blocked', 'Total Medicines', 'Avg Rating', 'Total Reviews', 'Registered On'];
        const rows = data.map(d => [
          d.pharmacyId, d.pharmacyName, d.ownerName, d.email, d.city, d.phone, d.approvalStatus, d.blocked, d.totalMedicines, d.averageRating, d.totalReviews, d.registeredOn?.split('T')[0] || ''
        ]);
        this.exportToExcel('Pharmacies_Report', headers, rows);
        this.isDownloading = '';
      },
      error: () => { this.isDownloading = ''; }
    });
  }

  downloadNursesReport(): void {
    this.isDownloading = 'nurses';
    this.adminService.getNursesReportData().subscribe({
      next: (data) => {
        const headers = ['Nurse ID', 'Full Name', 'Email', 'Phone', 'Specialization', 'Qualification', 'Status', 'Blocked', 'Availability', 'Total Requests', 'Completed', 'Avg Rating', 'Registered On'];
        const rows = data.map(d => [
          d.nurseId, d.fullName, d.email, d.phone, d.specialization, d.qualification, d.approvalStatus, d.blocked, d.availability, d.totalRequests, d.completedRequests, d.averageRating, d.registeredOn?.split('T')[0] || ''
        ]);
        this.exportToExcel('Nurses_Report', headers, rows);
        this.isDownloading = '';
      },
      error: () => { this.isDownloading = ''; }
    });
  }

  private exportToExcel(filename: string, headers: string[], rows: any[][]): void {
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-width columns
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || '').length));
      return { wch: Math.min(maxLen + 2, 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
