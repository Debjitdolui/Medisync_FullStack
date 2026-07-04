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
  requestStatus: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
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
}
