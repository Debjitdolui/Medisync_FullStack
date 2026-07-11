export interface Nurse {
  nurseId: number;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  licenseNumber: string;
  specialization: string;
  offeredServices?: NurseService[];
  availabilityStatus: 'online' | 'offline';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NurseRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  qualification: string;
  licenseNumber: string;
  specialization?: string;
  serviceIds?: number[];
}

export interface NurseService {
  serviceId: number;
  serviceName: string;
  description: string;
  basePrice: number;
  durationMinutes?: number;
}
