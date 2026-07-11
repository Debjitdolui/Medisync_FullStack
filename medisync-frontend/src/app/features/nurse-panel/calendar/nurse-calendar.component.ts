import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CalendarBooking {
  requestId: number;
  date: string;
  timeSlot: string;
  serviceName: string;
  durationMinutes: number;
  patientName: string;
  status: string;
}

interface DaySummary {
  date: string;
  bookings: CalendarBooking[];
  totalWorkMinutes: number;
  maxDailyMinutes: number;
  remainingMinutes: number;
  capacityPercent: number;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: CalendarBooking[];
}

@Component({
  selector: 'app-nurse-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nurse-calendar.component.html',
  styleUrl: './nurse-calendar.component.scss'
})
export class NurseCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth: number;
  currentYear: number;
  calendarDays: CalendarDay[] = [];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  selectedDay: CalendarDay | null = null;
  daySummary: DaySummary | null = null;
  loading = false;
  loadingSummary = false;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentMonth = this.currentDate.getMonth() + 1;
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.loadCalendar();
  }

  get monthYearLabel(): string {
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.selectedDay = null;
    this.daySummary = null;
    this.loadCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.selectedDay = null;
    this.daySummary = null;
    this.loadCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth() + 1;
    this.currentYear = today.getFullYear();
    this.selectedDay = null;
    this.daySummary = null;
    this.loadCalendar();
  }

  loadCalendar(): void {
    this.loading = true;
    this.buildCalendarGrid();

    this.http.get<CalendarBooking[]>(
      `${this.apiUrl}/nurse-requests/calendar?month=${this.currentMonth}&year=${this.currentYear}`
    ).subscribe({
      next: (bookings) => {
        this.mapBookingsToCalendar(bookings);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  buildCalendarGrid(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const today = new Date();

    // Get Monday-based day index for the first day of the month
    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex < 0) startDayIndex = 6; // Sunday becomes 6

    // Fill leading days from previous month
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth - 1, 0);
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay.getDate() - i;
      const date = new Date(this.currentYear, this.currentMonth - 2, day);
      this.calendarDays.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: this.isSameDate(date, today),
        bookings: []
      });
    }

    // Fill current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      this.calendarDays.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: this.isSameDate(date, today),
        bookings: []
      });
    }

    // Fill trailing days to complete the grid (always 6 rows = 42 cells)
    const remaining = 42 - this.calendarDays.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      this.calendarDays.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: this.isSameDate(date, today),
        bookings: []
      });
    }
  }

  mapBookingsToCalendar(bookings: CalendarBooking[]): void {
    for (const booking of bookings) {
      const bookingDate = new Date(booking.date);
      const calDay = this.calendarDays.find(d =>
        d.isCurrentMonth && d.date.getDate() === bookingDate.getDate()
      );
      if (calDay) {
        calDay.bookings.push(booking);
      }
    }
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDay = day;
    this.loadDaySummary(day.date);
  }

  loadDaySummary(date: Date): void {
    this.loadingSummary = true;
    const dateStr = this.formatDateParam(date);

    this.http.get<DaySummary>(
      `${this.apiUrl}/nurse-requests/day-summary?date=${dateStr}`
    ).subscribe({
      next: (summary) => {
        this.daySummary = summary;
        this.loadingSummary = false;
      },
      error: () => {
        this.daySummary = null;
        this.loadingSummary = false;
      }
    });
  }

  closeDayPanel(): void {
    this.selectedDay = null;
    this.daySummary = null;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'green';
      case 'pending': return 'orange';
      case 'completed': return 'gray';
      case 'blocked': return 'red';
      default: return 'gray';
    }
  }

  getStatusDots(bookings: CalendarBooking[]): string[] {
    const uniqueStatuses = [...new Set(bookings.map(b => this.getStatusColor(b.status)))];
    return uniqueStatuses.slice(0, 4);
  }

  formatDateParam(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateHeading(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getCapacityHours(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}min`;
  }

  private isSameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
}
