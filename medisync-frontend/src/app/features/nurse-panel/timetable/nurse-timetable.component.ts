import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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

  constructor(
    private nurseApi: NurseApiService,
    private toastr: ToastrService
  ) {}

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
        this.toastr.error('Failed to load schedule', 'Error');
        this.loading = false;
      }
    });
  }

  getSlotsForDay(day: string): NurseSchedule[] {
    return this.schedule.filter(s => s.dayOfWeek === day);
  }

  addSlot(): void {
    if (!this.newSlot.startTime || !this.newSlot.endTime) {
      this.toastr.warning('Please select start and end times', 'Validation');
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
        this.newSlot = { dayOfWeek: this.newSlot.dayOfWeek, startTime: '09:00', endTime: '17:00' };
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

  addBlockedDate(): void {
    if (!this.newBlockedDate) {
      this.toastr.warning('Please select a date to block', 'Validation');
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
    if (!confirm('Remove this blocked date?')) return;

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
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }
}
