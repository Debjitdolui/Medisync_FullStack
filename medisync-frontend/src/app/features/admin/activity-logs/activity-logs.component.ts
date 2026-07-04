import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminActivityLog } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss'
})
export class ActivityLogsComponent implements OnInit {
  logs: AdminActivityLog[] = [];
  actionFilter = 'all';

  currentPage = 1;
  pageSize = 10;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getLogs().subscribe(data => { this.logs = data; });
  }

  get filteredLogs(): AdminActivityLog[] {
    if (this.actionFilter === 'all') return this.logs;
    return this.logs.filter(l => l.action === this.actionFilter);
  }

  get paginatedLogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  getActionClass(action: string): string {
    if (action.includes('APPROVED')) return 'green';
    if (action.includes('REJECTED')) return 'red';
    if (action.includes('BLOCK')) return 'red';
    if (action.includes('UNBLOCK')) return 'blue';
    return 'orange';
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ');
  }
}
