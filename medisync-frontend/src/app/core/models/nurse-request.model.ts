import { User } from './user.model';
import { Nurse, NurseService } from './nurse.model';

export interface NurseRequest {
  requestId: number;
  patient: User;
  nurse: Nurse;
  service: NurseService;
  address: string;
  healthIssue?: string;
  requestDate: string;
  preferredTime?: string;
  timeSlot?: string;
  expiresAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  bookingGroupId?: string;
  requestStatus: 'pending' | 'accepted' | 'rejected' | 'expired' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateNurseRequestDto {
  nurseId: number;
  serviceId: number;
  address: string;
  healthIssue?: string;
  requestDate: string;
  preferredTime?: string;
  timeSlot?: string;
  paymentMethod?: string;
  bookingGroupId?: string;
  dates?: string[];
  timeSlots?: string[];
}

export interface NurseSchedule {
  scheduleId: number;
  nurse?: Nurse;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface NurseBlockedDate {
  blockedId: number;
  nurse?: Nurse;
  blockedDate: string;
  reason?: string;
}

export interface Payment {
  paymentId: number;
  request?: NurseRequest;
  user?: User;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'held' | 'confirmed' | 'refunded' | 'released';
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlotsResponse {
  nurseId: number;
  date: string;
  availableSlots: string[];
}
