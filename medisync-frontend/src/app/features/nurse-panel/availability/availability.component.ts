import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';

interface WeekDay {
  name: string;
  active: boolean;
  hours: string;
}

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss'
})
export class AvailabilityComponent implements OnInit {
  currentStatus: 'online' | 'offline' = 'online';
  pendingRequests = 0;
  acceptedRequests = 0;
  completedToday = 0;

  weekDays: WeekDay[] = [
    { name: 'Monday', active: true, hours: '9:00 AM - 6:00 PM' },
    { name: 'Tuesday', active: true, hours: '9:00 AM - 6:00 PM' },
    { name: 'Wednesday', active: true, hours: '9:00 AM - 6:00 PM' },
    { name: 'Thursday', active: true, hours: '9:00 AM - 6:00 PM' },
    { name: 'Friday', active: true, hours: '9:00 AM - 4:00 PM' },
    { name: 'Saturday', active: true, hours: '10:00 AM - 2:00 PM' },
    { name: 'Sunday', active: false, hours: '' }
  ];

  private nurseId = 1;

  constructor(
    private nurseService: NurseApiService,
    private nurseRequestService: NurseRequestService
  ) {}

  ngOnInit(): void {
    this.loadNurseStatus();
    this.loadRequestStats();
  }

  private loadNurseStatus(): void {
    this.nurseService.getNurseById(this.nurseId).subscribe(nurse => {
      this.currentStatus = nurse.availabilityStatus;
    });
  }

  private loadRequestStats(): void {
    this.nurseRequestService.getNurseRequests().subscribe(requests => {
      this.pendingRequests = requests.filter(r => r.requestStatus === 'pending').length;
      this.acceptedRequests = requests.filter(r => r.requestStatus === 'accepted').length;

      const today = new Date().toDateString();
      this.completedToday = requests.filter(r =>
        r.requestStatus === 'completed' &&
        new Date(r.updatedAt).toDateString() === today
      ).length;
    });
  }

  toggleAvailability(): void {
    const newStatus = this.currentStatus === 'online' ? 'offline' : 'online';
    this.nurseService.updateAvailability(newStatus).subscribe(nurse => {
      this.currentStatus = nurse.availabilityStatus;
    });
  }
}
