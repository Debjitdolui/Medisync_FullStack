import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseSchedule, NurseBlockedDate } from '../../../core/models/nurse-request.model';
import { NurseService, Nurse } from '../../../core/models/nurse.model';

interface NewSlot {
  dayOfWeek: string;
  serviceId: number | null;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-nurse-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-timetable.component.html',
  styleUrl: './nurse-timetable.component.scss'
})
export class NurseTimetableComponent implements OnInit {
  days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  dayLabels: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun'
  };
  dayColors: Record<string, string> = {
    MONDAY: '#1a73e8',
    TUESDAY: '#e91e63',
    WEDNESDAY: '#ff9800',
    THURSDAY: '#4caf50',
    FRIDAY: '#9c27b0',
    SATURDAY: '#00bcd4',
    SUNDAY: '#f44336'
  };

  schedule: NurseSchedule[] = [];
  blockedDates: NurseBlockedDate[] = [];
  services: NurseService[] = [];
  nurseProfile: Nurse | null = null;

  // New slot form
  newSlot: NewSlot = { dayOfWeek: 'MONDAY', serviceId: null, startTime: '09:00', endTime: '' };

  // Blocked date form
  newBlockedDate: string = '';
  newBlockedReason: string = '';
  todayDate: string = '';

  // UI state
  loading = false;
  saving = false;

  constructor(
    private nurseApi: NurseApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Set tomorrow's date as min for blocked dates (can't block same day)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.todayDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    this.loadSchedule();
    this.loadBlockedDates();
    this.loadServices();
    this.loadProfile();
  }

  // ─── Data Loading ──────────────────────────────────────────────────────────────

  loadSchedule(): void {
    this.loading = true;
    this.nurseApi.getMySchedule().subscribe({
      next: (data) => {
        this.schedule = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load schedule', 'Error');
        this.loading = false;
      }
    });
  }

  loadBlockedDates(): void {
    this.nurseApi.getBlockedDates().subscribe({
      next: (data) => {
        this.blockedDates = data;
      },
      error: () => {
        this.toastr.error('Failed to load blocked dates', 'Error');
      }
    });
  }

  loadServices(): void {
    this.nurseApi.getServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: () => {
        this.toastr.error('Failed to load services', 'Error');
      }
    });
  }

  loadProfile(): void {
    this.nurseApi.getMyProfile().subscribe({
      next: (data) => {
        this.nurseProfile = data;
      },
      error: () => {
        this.toastr.error('Failed to load profile', 'Error');
      }
    });
  }

  // ─── Computed Properties ───────────────────────────────────────────────────────

  get offeredServices(): NurseService[] {
    if (this.nurseProfile?.offeredServices && this.nurseProfile.offeredServices.length > 0) {
      return this.nurseProfile.offeredServices;
    }
    return this.services;
  }

  get totalSlots(): number {
    return this.schedule.length;
  }

  get totalHours(): number {
    let totalMinutes = 0;
    for (const slot of this.schedule) {
      if (slot.isActive) {
        const duration = this.getSlotDurationMinutes(slot);
        totalMinutes += duration;
      }
    }
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  get servicesCovered(): number {
    const durations = new Set<number>();
    for (const slot of this.schedule) {
      durations.add(this.getSlotDurationMinutes(slot));
    }
    let count = 0;
    for (const service of this.offeredServices) {
      if (service.durationMinutes && durations.has(service.durationMinutes)) {
        count++;
      }
    }
    return count || durations.size;
  }

  get selectedService(): NurseService | null {
    if (!this.newSlot.serviceId) return null;
    return this.offeredServices.find(s => s.serviceId === this.newSlot.serviceId) || null;
  }

  // ─── Schedule Methods ─────────────────────────────────────────────────────────

  getSlotsForDay(day: string): NurseSchedule[] {
    return this.schedule.filter(s => s.dayOfWeek === day);
  }

  getSlotDurationMinutes(slot: NurseSchedule): number {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }

  getSlotColorClass(slot: NurseSchedule): string {
    const duration = this.getSlotDurationMinutes(slot);
    if (duration <= 60) return 'slot-short';
    if (duration <= 240) return 'slot-medium';
    return 'slot-long';
  }

  getServiceForSlot(slot: NurseSchedule): NurseService | null {
    const duration = this.getSlotDurationMinutes(slot);
    return this.offeredServices.find(s => s.durationMinutes === duration) || null;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  // ─── Slot Form Methods ────────────────────────────────────────────────────────

  selectDay(day: string): void {
    this.newSlot.dayOfWeek = day;
  }

  onServiceChange(): void {
    this.calculateEndTime();
  }

  onStartTimeChange(): void {
    this.calculateEndTime();
  }

  calculateEndTime(): void {
    const service = this.selectedService;
    if (!service || !service.durationMinutes || !this.newSlot.startTime) {
      this.newSlot.endTime = '';
      return;
    }

    const [hours, minutes] = this.newSlot.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.durationMinutes;
    
    if (totalMinutes > 1200) { // 20:00 = 1200 minutes
      this.toastr.warning('Slot exceeds 8:00 PM. Choose an earlier start time.', 'Time Limit');
      this.newSlot.endTime = '';
      return;
    }

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    this.newSlot.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  addSlot(): void {
    if (!this.newSlot.serviceId) {
      this.toastr.warning('Please select a service', 'Validation');
      return;
    }

    if (!this.newSlot.startTime || !this.newSlot.endTime) {
      this.toastr.warning('Please select a start time', 'Validation');
      return;
    }

    if (this.newSlot.startTime < '08:00') {
      this.toastr.warning('Start time cannot be before 8:00 AM', 'Validation');
      return;
    }

    if (this.newSlot.endTime > '20:00') {
      this.toastr.warning('End time cannot be after 8:00 PM', 'Validation');
      return;
    }

    if (this.newSlot.startTime >= this.newSlot.endTime) {
      this.toastr.warning('End time must be after start time', 'Validation');
      return;
    }

    this.saving = true;

    this.nurseApi.addSlot(this.newSlot.dayOfWeek, this.newSlot.startTime, this.newSlot.endTime).subscribe({
      next: (saved) => {
        this.schedule.push(saved);
        this.saving = false;
        this.toastr.success('Slot added successfully!', 'Added');
        this.newSlot = { dayOfWeek: this.newSlot.dayOfWeek, serviceId: this.newSlot.serviceId, startTime: '09:00', endTime: '' };
        this.calculateEndTime();
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Failed to add slot. It may overlap with an existing slot.', 'Error');
        this.saving = false;
      }
    });
  }

  toggleSlot(slot: NurseSchedule): void {
    this.nurseApi.toggleScheduleSlot(slot.scheduleId).subscribe({
      next: (updated) => {
        const index = this.schedule.findIndex(s => s.scheduleId === slot.scheduleId);
        if (index > -1) {
          this.schedule[index] = updated;
        }
        this.toastr.success(`Slot ${updated.isActive ? 'activated' : 'deactivated'}`, 'Updated');
      },
      error: () => {
        this.toastr.error('Failed to toggle slot', 'Error');
      }
    });
  }

  deleteSlot(slot: NurseSchedule): void {
    if (!confirm(`Delete ${this.dayLabels[slot.dayOfWeek]} ${slot.startTime} - ${slot.endTime}?`)) {
      return;
    }

    this.nurseApi.deleteScheduleSlot(slot.scheduleId).subscribe({
      next: () => {
        this.schedule = this.schedule.filter(s => s.scheduleId !== slot.scheduleId);
        this.toastr.success('Slot deleted', 'Deleted');
      },
      error: () => {
        this.toastr.error('Failed to delete slot', 'Error');
      }
    });
  }

  // ─── Blocked Dates Methods ─────────────────────────────────────────────────────

  addBlockedDate(): void {
    if (!this.newBlockedDate) {
      this.toastr.warning('Please select a date to block', 'Validation');
      return;
    }

    // Prevent same-day and past dates
    if (this.newBlockedDate < this.todayDate) {
      this.toastr.error('Cannot block today or past dates. Leave must be planned at least 1 day in advance.', 'Invalid Date');
      return;
    }

    this.nurseApi.addBlockedDate(this.newBlockedDate, this.newBlockedReason || undefined).subscribe({
      next: () => {
        this.loadBlockedDates();
        this.newBlockedDate = '';
        this.newBlockedReason = '';
        this.toastr.success('Date blocked successfully', 'Blocked');
      },
      error: () => {
        this.toastr.error('Failed to block date', 'Error');
      }
    });
  }

  removeBlockedDate(blockedId: number): void {
    this.nurseApi.removeBlockedDate(blockedId).subscribe({
      next: () => {
        this.blockedDates = this.blockedDates.filter(d => d.blockedId !== blockedId);
        this.toastr.success('Blocked date removed', 'Removed');
      },
      error: () => {
        this.toastr.error('Failed to remove blocked date', 'Error');
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
