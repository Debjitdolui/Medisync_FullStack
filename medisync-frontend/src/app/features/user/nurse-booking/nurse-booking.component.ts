import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { Nurse, NurseService } from '../../../core/models';

@Component({
  selector: 'app-nurse-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-booking.component.html',
  styleUrl: './nurse-booking.component.scss'
})
export class NurseBookingComponent implements OnInit {
  services: NurseService[] = [];
  allNurses: Nurse[] = [];
  filteredNurses: Nurse[] = [];
  selectedService: NurseService | null = null;
  showBookingModal = false;
  selectedNurse: Nurse | null = null;

  // Booking form
  bookingAddress = '';
  bookingHealthIssue = '';
  bookingDate = '';
  bookingTime = '';
  isBooking = false;
  bookingSuccess = false;
  minBookingDate = '';

  // Service → Specialization mapping for filtering
  private serviceSpecMap: { [key: string]: string[] } = {
    'Home Injection': ['Home Care', 'IV Therapy'],
    'Wound Dressing': ['Wound Care', 'Home Care'],
    'Vital Monitoring': ['Elderly Care', 'Home Care']
  };

  constructor(
    private nurseService: NurseApiService,
    private nurseRequestService: NurseRequestService
  ) {}

  ngOnInit(): void {
    // Set minimum booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minBookingDate = tomorrow.toISOString().split('T')[0];

    this.nurseService.getServices().subscribe(s => this.services = s);
    this.nurseService.getAvailableNurses().subscribe(n => {
      this.allNurses = n;
      this.filteredNurses = [...n];
    });
  }

  selectService(service: NurseService): void {
    if (this.selectedService?.serviceId === service.serviceId) {
      // Deselect if clicking same service
      this.selectedService = null;
      this.filteredNurses = [...this.allNurses];
    } else {
      this.selectedService = service;
      this.filterNursesByService(service);
    }
  }

  clearServiceFilter(): void {
    this.selectedService = null;
    this.filteredNurses = [...this.allNurses];
  }

  private filterNursesByService(service: NurseService): void {
    const matchingSpecs = this.serviceSpecMap[service.serviceName] || [];

    if (matchingSpecs.length === 0) {
      // No mapping found, show all
      this.filteredNurses = [...this.allNurses];
      return;
    }

    this.filteredNurses = this.allNurses.filter(nurse =>
      matchingSpecs.some(spec =>
        nurse.specialization.toLowerCase().includes(spec.toLowerCase())
      )
    );

    // If no nurses match, show all (better UX than empty)
    if (this.filteredNurses.length === 0) {
      this.filteredNurses = [...this.allNurses];
    }
  }

  getNurseRating(nurseId: number): { average: number; total: number } {
    return { average: 0, total: 0 };
  }

  getDistance(nurseId: number): string {
    // Mock distances based on nurse ID
    const distances = [1.2, 2.1, 3.4, 1.8, 2.7];
    return distances[nurseId % distances.length].toFixed(1);
  }

  openBooking(nurse: Nurse): void {
    this.selectedNurse = nurse;
    this.showBookingModal = true;
    this.bookingSuccess = false;
  }

  closeBooking(): void {
    this.showBookingModal = false;
    this.selectedNurse = null;
    this.bookingAddress = '';
    this.bookingHealthIssue = '';
    this.bookingDate = '';
    this.bookingTime = '';
  }

  confirmBooking(): void {
    if (!this.selectedNurse || !this.bookingAddress || !this.bookingDate) return;
    this.isBooking = true;

    this.nurseRequestService.createRequest({
      nurseId: this.selectedNurse.nurseId,
      serviceId: this.selectedService?.serviceId || 1,
      address: this.bookingAddress,
      healthIssue: this.bookingHealthIssue,
      requestDate: this.bookingDate,
      preferredTime: this.bookingTime
    }).subscribe({
      next: () => {
        this.isBooking = false;
        this.bookingSuccess = true;
      },
      error: () => {
        this.isBooking = false;
      }
    });
  }

  getServiceIcon(index: number): string {
    const icons = ['ti-vaccine', 'ti-bandage', 'ti-heartbeat'];
    return icons[index] || 'ti-stethoscope';
  }
}
