export interface Notification {
  notificationId: number;
  recipientEmail: string;
  recipientType: string; // "user", "pharmacy", "nurse"
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
