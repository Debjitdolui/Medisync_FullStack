import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Pharmacy } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-pharmacy-approvals',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './pharmacy-approvals.component.html',
  styleUrl: './pharmacy-approvals.component.scss'
})
export class PharmacyApprovalsComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  activeTab: 'all' | 'pending' | 'approved' | 'rejected' = 'all';

  currentPage = 1;
  pageSize = 10;

  // Confirmation modal
  showModal = false;
  modalAction: 'block' | 'unblock' | '' = '';
  modalTarget: Pharmacy | null = null;
  isProcessing = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadPharmacies(); }

  loadPharmacies(): void {
    this.adminService.getAllPharmacies().subscribe(page => { this.pharmacies = [...page.content]; });
  }

  get filteredPharmacies(): Pharmacy[] {
    if (this.activeTab === 'all') return this.pharmacies;
    return this.pharmacies.filter(p => p.approvalStatus === this.activeTab);
  }

  get paginatedPharmacies() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPharmacies.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) { this.currentPage = page; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  getCount(status: string): number {
    return this.pharmacies.filter(p => p.approvalStatus === status).length;
  }

  approve(id: number): void {
    this.adminService.approvePharmacy(id, 'approved').subscribe(() => this.loadPharmacies());
  }

  reject(id: number): void {
    this.adminService.approvePharmacy(id, 'rejected').subscribe(() => this.loadPharmacies());
  }

  // Modal actions
  openBlockModal(pharmacy: Pharmacy): void {
    this.modalTarget = pharmacy;
    this.modalAction = 'block';
    this.showModal = true;
  }

  openUnblockModal(pharmacy: Pharmacy): void {
    this.modalTarget = pharmacy;
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

    const id = this.modalTarget.pharmacyId;
    const action$ = this.modalAction === 'block'
      ? this.adminService.blockPharmacy(id)
      : this.adminService.unblockPharmacy(id);

    action$.subscribe({
      next: (updatedPharmacy) => {
        // Update local array directly — no need to refetch
        const index = this.pharmacies.findIndex(p => p.pharmacyId === id);
        if (index > -1) {
          this.pharmacies[index] = { ...this.pharmacies[index], isBlocked: this.modalAction === 'block' };
        }
        // Force Angular to detect changes by reassigning array
        this.pharmacies = [...this.pharmacies];
        this.isProcessing = false;
        this.closeModal();
      },
      error: () => {
        this.isProcessing = false;
        this.closeModal();
      }
    });
  }
}
