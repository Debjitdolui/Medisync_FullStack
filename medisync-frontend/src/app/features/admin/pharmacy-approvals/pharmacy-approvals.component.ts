import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacyService } from '../../../core/services/pharmacy.service';
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

  constructor(private pharmacyService: PharmacyService, private adminService: AdminService) {}

  ngOnInit(): void { this.loadPharmacies(); }

  loadPharmacies(): void {
    this.pharmacyService.getAllPharmacies().subscribe(data => { this.pharmacies = data; });
  }

  get filteredPharmacies(): Pharmacy[] {
    if (this.activeTab === 'all') return this.pharmacies;
    return this.pharmacies.filter(p => p.approvalStatus === this.activeTab);
  }

  get paginatedPharmacies() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPharmacies.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  getCount(status: string): number {
    return this.pharmacies.filter(p => p.approvalStatus === status).length;
  }

  approve(id: number): void {
    this.adminService.approvePharmacy(id, 'approved').subscribe(() => this.loadPharmacies());
  }

  reject(id: number): void {
    this.adminService.approvePharmacy(id, 'rejected').subscribe(() => this.loadPharmacies());
  }
}
