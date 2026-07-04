import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseApiService } from '../../../core/services/nurse.service';
import { AdminService } from '../../../core/services/admin.service';
import { Nurse } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-nurse-approvals',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './nurse-approvals.component.html',
  styleUrl: './nurse-approvals.component.scss'
})
export class NurseApprovalsComponent implements OnInit {
  nurses: Nurse[] = [];
  activeTab: 'all' | 'pending' | 'approved' | 'rejected' = 'all';

  currentPage = 1;
  pageSize = 10;

  constructor(private nurseService: NurseApiService, private adminService: AdminService) {}

  ngOnInit(): void { this.loadNurses(); }

  loadNurses(): void {
    this.nurseService.getAllNurses().subscribe(data => { this.nurses = data; });
  }

  get filteredNurses(): Nurse[] {
    if (this.activeTab === 'all') return this.nurses;
    return this.nurses.filter(n => n.approvalStatus === this.activeTab);
  }

  get paginatedNurses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNurses.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  getCount(status: string): number {
    return this.nurses.filter(n => n.approvalStatus === status).length;
  }

  approve(id: number): void {
    this.adminService.approveNurse(id, 'approved').subscribe(() => this.loadNurses());
  }

  reject(id: number): void {
    this.adminService.approveNurse(id, 'rejected').subscribe(() => this.loadNurses());
  }
}
