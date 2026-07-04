export interface User {
  userId: number;
  username: string;
  email: string;
  phone?: string;
  role?: string;
  status: 'active' | 'inactive' | 'blocked';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  phone?: string;
}
