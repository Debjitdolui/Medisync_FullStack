import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { ReviewService } from '../../../core/services/review.service';
import { NurseRequest } from '../../../core/models';

@Component({
  selector: 'app-nurse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nurse-dashboard.component.html',
  styleUrl: './nurse-dashboard.component.scss'
})
export class NurseDashboardComponent implements OnInit {
  nurseName = '';
  nurseInitial = '';
  specialization = '';
  qualification = '';
  nursePhone = '';
  nurseEmail = '';
  licenseNumber = '';
  memberSince = '';
  currentStatus: 'online' | 'offline' = 'online';

  totalRequests = 0;
  pendingRequests = 0;
  completedRequests = 0;
  totalEarnings = 0;
  averageRating = '0.0';
  totalReviews = 0;

  recentRequests: NurseRequest[] = [];

  private nurseId = 1;

  constructor(
    private nurseService: NurseApiService,
    private nurseRequestService: NurseRequestService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadNurseData();
    this.loadRequests();
  }

  private loadNurseData(): void {
    this.nurseService.getMyProfile().subscribe(nurse => {
      this.nurseId = nurse.nurseId;
      this.nurseName = nurse.fullName;
      this.nurseInitial = nurse.fullName.charAt(0).toUpperCase();
      this.specialization = nurse.specialization;
      this.qualification = nurse.qualification;
      this.nursePhone = nurse.phone;
      this.nurseEmail = nurse.email;
      this.licenseNumber = nurse.licenseNumber;
      this.currentStatus = nurse.availabilityStatus;
      this.memberSince = new Date(nurse.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      this.loadRating();
    });
  }

  private loadRequests(): void {
    this.nurseRequestService.getNurseRequests().subscribe(requests => {
      this.totalRequests = requests.length;
      this.pendingRequests = requests.filter(r => r.requestStatus === 'pending').length;
      this.completedRequests = requests.filter(r => r.requestStatus === 'completed').length;
      this.totalEarnings = requests
        .filter(r => r.requestStatus === 'completed')
        .reduce((sum, r) => sum + (r.service?.basePrice || 0), 0);
      this.recentRequests = requests.slice(0, 4);
    });
  }

  private loadRating(): void {
    this.reviewService.getNurseReviews(this.nurseId).subscribe(page => {
      const reviews = page.content;
      this.totalReviews = page.totalElements;
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        this.averageRating = (sum / reviews.length).toFixed(1);
      } else {
        this.averageRating = '0.0';
      }
    });
  }

  toggleStatus(): void {
    const newStatus = this.currentStatus === 'online' ? 'offline' : 'online';
    this.nurseService.updateAvailability(newStatus).subscribe(nurse => {
      this.currentStatus = nurse.availabilityStatus;
    });
  }
}
