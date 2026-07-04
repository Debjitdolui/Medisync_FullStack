export interface Nurse {
  nurseId: number;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  licenseNumber: string;
  specialization: string;
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
  specialization: string;
}

export interface NurseService {
  serviceId: number;
  serviceName: string;
  description: string;
  basePrice: number;
}
