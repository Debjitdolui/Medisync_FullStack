import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
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
  monthlyEarnings = 0;
  currentMonth = '';

  recentRequests: NurseRequest[] = [];

  private nurseId = 1;

  constructor(
    private nurseService: NurseApiService,
    private nurseRequestService: NurseRequestService
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
    });
  }

  private loadRequests(): void {
    this.nurseRequestService.getNurseRequests().subscribe(requests => {
      this.totalRequests = requests.length;
      this.pendingRequests = requests.filter(r => r.requestStatus === 'pending').length;
      this.completedRequests = requests.filter(r => r.requestStatus === 'completed').length;

      // Calculate monthly earnings (current month only)
      const now = new Date();
      this.currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const currentMonthNum = now.getMonth();
      const currentYear = now.getFullYear();

      this.monthlyEarnings = requests
        .filter(r => {
          if (r.requestStatus !== 'completed') return false;
          const rDate = new Date(r.requestDate);
          return rDate.getMonth() === currentMonthNum && rDate.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + (r.service?.basePrice || 0), 0);

      this.recentRequests = requests.slice(0, 4);
    });
  }

  toggleStatus(): void {
    const newStatus = this.currentStatus === 'online' ? 'offline' : 'online';
    this.nurseService.updateAvailability(newStatus).subscribe(nurse => {
      this.currentStatus = nurse.availabilityStatus;
    });
  }
}
