import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { ReviewService } from '../../../core/services/review.service';
import { Nurse, NurseService, NurseRequest } from '../../../core/models';

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

  // Slot-based booking flow
  bookingStep: 'details' | 'date' | 'slots' | 'confirm' = 'details';
  availableDates: { date: string; label: string; dayName: string }[] = [];
  selectedDate = '';
  availableSlots: string[] = [];
  selectedSlot = '';
  loadingSlots = false;
  slotsError = '';
  confirmedBooking: NurseRequest | null = null;

  constructor(
    private nurseService: NurseApiService,
    private nurseRequestService: NurseRequestService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    // Set minimum booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minBookingDate = tomorrow.toISOString().split('T')[0];

    this.generateAvailableDates();

    this.nurseService.getServices().subscribe(s => this.services = s);
    this.nurseService.getAvailableNurses().subscribe(n => {
      this.allNurses = n;
      this.filteredNurses = [...n];
    });
  }

  private generateAvailableDates(): void {
    const today = new Date();
    this.availableDates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      this.availableDates.push({ date: dateStr, label, dayName });
    }
  }

  selectService(service: NurseService): void {
    if (this.selectedService?.serviceId === service.serviceId) {
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
    this.nurseService.getAvailableNurses(service.serviceId).subscribe(nurses => {
      this.filteredNurses = nurses;
    });
  }

  // Ratings cache
  private nurseRatingsCache: Map<number, { average: number; total: number }> = new Map();

  getNurseRating(nurseId: number): { average: number; total: number } {
    if (!this.nurseRatingsCache.has(nurseId)) {
      this.nurseRatingsCache.set(nurseId, { average: 0, total: 0 });
      this.reviewService.getNurseReviews(nurseId, { page: 0, size: 100 }).subscribe(page => {
        const reviews = page.content;
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          this.nurseRatingsCache.set(nurseId, { average: Math.round(avg * 10) / 10, total: reviews.length });
        }
      });
    }
    return this.nurseRatingsCache.get(nurseId) || { average: 0, total: 0 };
  }

  getDistance(nurseId: number): string {
    return 'Home Visit';
  }

  openBooking(nurse: Nurse): void {
    this.selectedNurse = nurse;
    this.showBookingModal = true;
    this.bookingSuccess = false;
    this.bookingStep = 'details';
    this.resetSlotFlow();
  }

  closeBooking(): void {
    this.showBookingModal = false;
    this.selectedNurse = null;
    this.bookingAddress = '';
    this.bookingHealthIssue = '';
    this.bookingDate = '';
    this.bookingTime = '';
    this.resetSlotFlow();
  }

  private resetSlotFlow(): void {
    this.selectedDate = '';
    this.availableSlots = [];
    this.selectedSlot = '';
    this.loadingSlots = false;
    this.slotsError = '';
    this.confirmedBooking = null;
  }

  // Step navigation
  proceedToDateSelection(): void {
    if (!this.bookingAddress) return;
    this.bookingStep = 'date';
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.selectedSlot = '';
    this.loadingSlots = true;
    this.slotsError = '';
    this.availableSlots = [];
    this.bookingStep = 'slots';

    this.nurseRequestService.getAvailableSlots(this.selectedNurse!.nurseId, date).subscribe({
      next: (response) => {
        this.availableSlots = response.availableSlots;
        this.loadingSlots = false;
        if (this.availableSlots.length === 0) {
          this.slotsError = 'No available slots for this date. Please try another date.';
        }
      },
      error: () => {
        this.loadingSlots = false;
        this.slotsError = 'Failed to load available slots. Please try again.';
      }
    });
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }

  goBackToDate(): void {
    this.bookingStep = 'date';
    this.selectedSlot = '';
  }

  goBackToSlots(): void {
    this.bookingStep = 'slots';
  }

  goBackToDetails(): void {
    this.bookingStep = 'details';
  }

  proceedToConfirm(): void {
    if (!this.selectedSlot) return;
    this.confirmBooking();
  }

  confirmBooking(): void {
    if (!this.selectedNurse || !this.bookingAddress || !this.selectedDate || !this.selectedSlot) return;
    this.isBooking = true;

    this.nurseRequestService.createRequest({
      nurseId: this.selectedNurse.nurseId,
      serviceId: this.selectedService?.serviceId || 1,
      address: this.bookingAddress,
      healthIssue: this.bookingHealthIssue,
      requestDate: this.selectedDate,
      preferredTime: this.selectedSlot,
      timeSlot: this.selectedSlot
    }).subscribe({
      next: (booking) => {
        this.isBooking = false;
        this.bookingSuccess = true;
        this.confirmedBooking = booking;
        this.bookingStep = 'confirm';
      },
      error: () => {
        this.isBooking = false;
      }
    });
  }

  getFormattedDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  getBufferEndTime(slot: string): string {
    // Slot format: "10:00 AM - 11:00 AM" — buffer is 30 min before start
    const startTime = slot.split(' - ')[0];
    return `${startTime} (30 min before your slot)`;
  }

  getServiceIcon(index: number): string {
    const icons = ['ti-vaccine', 'ti-bandage', 'ti-heartbeat'];
    return icons[index] || 'ti-stethoscope';
  }
}
