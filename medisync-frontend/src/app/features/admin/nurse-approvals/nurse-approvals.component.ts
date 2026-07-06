import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // Confirmation modal
  showModal = false;
  modalAction: 'block' | 'unblock' | '' = '';
  modalTarget: Nurse | null = null;
  isProcessing = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadNurses(); }

  loadNurses(): void {
    this.adminService.getAllNurses().subscribe(page => { this.nurses = [...page.content]; });
  }

  get filteredNurses(): Nurse[] {
    if (this.activeTab === 'all') return this.nurses;
    return this.nurses.filter(n => n.approvalStatus === this.activeTab);
  }

  get paginatedNurses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNurses.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) { this.currentPage = page; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  getCount(status: string): number {
    return this.nurses.filter(n => n.approvalStatus === status).length;
  }

  approve(id: number): void {
    this.adminService.approveNurse(id, 'approved').subscribe(() => this.loadNurses());
  }

  reject(id: number): void {
    this.adminService.approveNurse(id, 'rejected').subscribe(() => this.loadNurses());
  }

  // Modal actions
  openBlockModal(nurse: Nurse): void {
    this.modalTarget = nurse;
    this.modalAction = 'block';
    this.showModal = true;
  }

  openUnblockModal(nurse: Nurse): void {
    this.modalTarget = nurse;
    this.modalAction = 'unblock';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalTarget = null;
    this.modalAction = '';
  }

  confirmAction(): void {
    if (!this.modalTarget) return;
    this.isProcessing = true;

    const id = this.modalTarget.nurseId;

    if (this.modalAction === 'block') {
      this.adminService.blockNurse(id).subscribe({
        next: (updated) => {
          // Directly mutate the item in array
          const nurse = this.nurses.find(n => n.nurseId === id);
          if (nurse) {
            nurse.isBlocked = true;
          }
          this.isProcessing = false;
          this.showModal = false;
          this.modalTarget = null;
        },
        error: () => { this.isProcessing = false; this.showModal = false; }
      });
    } else {
      this.adminService.unblockNurse(id).subscribe({
        next: (updated) => {
          const nurse = this.nurses.find(n => n.nurseId === id);
          if (nurse) {
            nurse.isBlocked = false;
          }
          this.isProcessing = false;
          this.showModal = false;
          this.modalTarget = null;
        },
        error: () => { this.isProcessing = false; this.showModal = false; }
      });
    }
  }
}
