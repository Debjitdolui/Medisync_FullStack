import { User } from './user.model';

export interface Notification {
  notificationId: number;
  user: User;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
