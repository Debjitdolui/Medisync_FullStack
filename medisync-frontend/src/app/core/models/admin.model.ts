import { User } from './user.model';

export interface AdminDashboard {
  totalUsers: number;
  totalPharmacies: number;
  approvedPharmacies: number;
  pendingPharmacies: number;
  totalNurses: number;
  totalMedicines: number;
}

export interface AdminReport {
  totalUsers: number;
  totalPharmacies: number;
  approvedPharmacies: number;
  pendingPharmacies: number;
  rejectedPharmacies: number;
  totalNurses: number;
  approvedNurses: number;
  pendingNurses: number;
  totalMedicines: number;
}

export interface AdminActivityLog {
  logId: number;
  admin: User | null;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: string;
}
