import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { NurseRequest } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nurse-requests',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './nurse-requests.component.html',
  styleUrl: './nurse-requests.component.scss'
})
export class NurseRequestsComponent implements OnInit {
  allRequests: NurseRequest[] = [];
  filteredRequests: NurseRequest[] = [];
  activeTab = 'all';

  pendingCount = 0;
  acceptedCount = 0;
  completedCount = 0;
  cancelledCount = 0;

  currentPage = 1;
  pageSize = 10;

  // Payment status tracking
  paymentStatus: Map<number, boolean> = new Map();

  get paginatedRequests() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  constructor(
    private nurseRequestService: NurseRequestService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.nurseRequestService.getNurseRequests().subscribe(requests => {
      this.allRequests = requests;
      this.computeCounts();
      this.applyFilter();
      this.checkPaymentStatuses();
    });
  }

  private checkPaymentStatuses(): void {
    this.allRequests.forEach(req => {
      if (req.requestStatus === 'accepted' || req.requestStatus === 'completed') {
        this.http.get<any>(`${environment.apiUrl}/nurse-requests/${req.requestId}/payment`).subscribe({
          next: (payment) => {
            this.paymentStatus.set(req.requestId, payment?.paid === true);
          },
          error: () => {
            this.paymentStatus.set(req.requestId, false);
          }
        });
      }
    });
  }

  private computeCounts(): void {
    this.pendingCount = this.allRequests.filter(r => r.requestStatus === 'pending').length;
    this.acceptedCount = this.allRequests.filter(r => r.requestStatus === 'accepted').length;
    this.completedCount = this.allRequests.filter(r => r.requestStatus === 'completed').length;
    this.cancelledCount = this.allRequests.filter(r => r.requestStatus === 'cancelled').length;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredRequests = [...this.allRequests];
    } else {
      this.filteredRequests = this.allRequests.filter(r => r.requestStatus === this.activeTab);
    }
  }

  updateStatus(request: NurseRequest, status: string): void {
    this.nurseRequestService.updateRequestStatus(request.requestId, status).subscribe(() => {
      this.loadRequests();
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab) {
      case 'pending': return 'No pending requests at the moment.';
      case 'accepted': return 'No active requests currently.';
      case 'completed': return 'No completed requests yet.';
      case 'cancelled': return 'No cancelled requests.';
      default: return 'You haven\'t received any requests yet.';
    }
  }
}
