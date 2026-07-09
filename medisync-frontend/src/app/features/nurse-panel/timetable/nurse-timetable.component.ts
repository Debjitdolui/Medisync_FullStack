import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NurseApiService } from '../../../core/services/nurse.service';
import { NurseSchedule, NurseBlockedDate } from '../../../core/models/nurse-request.model';

interface NewSlot {
  dayOfWeek: string;
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

  schedule: NurseSchedule[] = [];
  blockedDates: NurseBlockedDate[] = [];

  // New slot form
  newSlot: NewSlot = { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' };

  // Blocked date form
  newBlockedDate: string = '';
  newBlockedReason: string = '';

  // UI state
  loading = false;
  saving = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private nurseApi: NurseApiService) {}

  ngOnInit(): void {
    this.loadSchedule();
    this.loadBlockedDates();
  }

  // ─── Schedule Methods ─────────────────────────────────────────────────────────

  loadSchedule(): void {
    this.loading = true;
    this.nurseApi.getMySchedule().subscribe({
      next: (data) => {
        this.schedule = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load schedule';
        this.loading = false;
      }
    });
  }

  getSlotsForDay(day: string): NurseSchedule[] {
    return this.schedule.filter(s => s.dayOfWeek === day);
  }

  addSlot(): void {
    if (!this.newSlot.startTime || !this.newSlot.endTime) {
      this.error = 'Please select start and end times';
      return;
    }

    if (this.newSlot.startTime >= this.newSlot.endTime) {
      this.error = 'End time must be after start time';
      return;
    }

    this.saving = true;
    this.error = null;

    this.nurseApi.addSlot(this.newSlot.dayOfWeek, this.newSlot.startTime, this.newSlot.endTime).subscribe({
      next: (saved) => {
        this.schedule.push(saved);
        this.saving = false;
        this.successMessage = 'Slot added successfully!';
        this.newSlot = { dayOfWeek: this.newSlot.dayOfWeek, startTime: '09:00', endTime: '17:00' };
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add slot. It may overlap with an existing slot.';
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
      },
      error: () => {
        this.error = 'Failed to toggle slot';
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
        this.successMessage = 'Slot deleted';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete slot';
      }
    });
  }

  // ─── Blocked Dates Methods ─────────────────────────────────────────────────────

  loadBlockedDates(): void {
    this.nurseApi.getBlockedDates().subscribe({
      next: (data) => {
        this.blockedDates = data;
      },
      error: () => {
        this.error = 'Failed to load blocked dates';
      }
    });
  }

  addBlockedDate(): void {
    if (!this.newBlockedDate) {
      this.error = 'Please select a date to block';
      return;
    }

    this.nurseApi.addBlockedDate(this.newBlockedDate, this.newBlockedReason || undefined).subscribe({
      next: () => {
        this.loadBlockedDates();
        this.newBlockedDate = '';
        this.newBlockedReason = '';
        this.successMessage = 'Date blocked successfully';
        this.error = null;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to block date';
      }
    });
  }

  removeBlockedDate(blockedId: number): void {
    if (!confirm('Remove this blocked date?')) return;

    this.nurseApi.removeBlockedDate(blockedId).subscribe({
      next: () => {
        this.blockedDates = this.blockedDates.filter(d => d.blockedId !== blockedId);
        this.successMessage = 'Blocked date removed';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to remove blocked date';
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  dismissError(): void {
    this.error = null;
  }

  dismissSuccess(): void {
    this.successMessage = null;
  }
}
