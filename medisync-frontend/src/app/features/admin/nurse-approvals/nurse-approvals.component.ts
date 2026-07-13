import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../core/services/admin.service';
import { Nurse, NurseService } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nurse-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
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

  // Services modal
  showServicesModal = false;
  nurseServices: NurseService[] = [];
  newService = { serviceName: '', description: '', basePrice: 0, durationMinutes: 60 };

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadNurses();
    this.loadServices();
  }

  private loadServices(): void {
    this.http.get<NurseService[]>(`${environment.apiUrl}/admin/nurse-services`).subscribe(s => {
      this.nurseServices = s;
    });
  }

  addService(): void {
    if (!this.newService.serviceName.trim()) return;
    this.http.post<NurseService>(`${environment.apiUrl}/admin/nurse-services`, this.newService).subscribe({
      next: (s) => {
        this.nurseServices.push(s);
        this.newService = { serviceName: '', description: '', basePrice: 0, durationMinutes: 60 };
        this.toastr.success('Service added successfully', 'Service Added');
      },
      error: () => {
        this.toastr.error('Failed to add service', 'Error');
      }
    });
  }

  deleteService(id: number): void {
    this.http.delete(`${environment.apiUrl}/admin/nurse-services/${id}`).subscribe({
      next: () => {
        this.nurseServices = this.nurseServices.filter(s => s.serviceId !== id);
        this.toastr.success('Service deleted successfully', 'Service Deleted');
      },
      error: () => {
        this.toastr.error('Failed to delete service', 'Error');
      }
    });
  }

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
    this.adminService.approveNurse(id, 'approved').subscribe({
      next: () => {
        this.toastr.success('Nurse approved successfully', 'Approved');
        this.loadNurses();
      },
      error: () => {
        this.toastr.error('Failed to approve nurse', 'Error');
      }
    });
  }

  reject(id: number): void {
    this.adminService.approveNurse(id, 'rejected').subscribe({
      next: () => {
        this.toastr.warning('Nurse rejected', 'Rejected');
        this.loadNurses();
      },
      error: () => {
        this.toastr.error('Failed to reject nurse', 'Error');
      }
    });
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
          const nurse = this.nurses.find(n => n.nurseId === id);
          if (nurse) {
            nurse.isBlocked = true;
          }
          this.isProcessing = false;
          this.showModal = false;
          this.modalTarget = null;
          this.toastr.success('Nurse blocked successfully', 'Blocked');
        },
        error: () => {
          this.isProcessing = false;
          this.showModal = false;
          this.toastr.error('Failed to block nurse', 'Error');
        }
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
          this.toastr.success('Nurse unblocked successfully', 'Unblocked');
        },
        error: () => {
          this.isProcessing = false;
          this.showModal = false;
          this.toastr.error('Failed to unblock nurse', 'Error');
        }
      });
    }
  }
}
