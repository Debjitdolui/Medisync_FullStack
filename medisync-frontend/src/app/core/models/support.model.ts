export interface SupportTicket {
  ticketId: number;
  raisedByUserId: number;
  raisedByUsername: string;
  raisedByRole: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  assignedToUserId: number | null;
  assignedToUsername: string | null;
  escalationReason: string | null;
  messagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  messageId: number;
  senderUserId: number;
  senderUsername: string;
  senderRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketDetail {
  ticketId: number;
  raisedByUserId: number;
  raisedByUsername: string;
  raisedByRole: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  assignedToUserId: number | null;
  assignedToUsername: string | null;
  escalationReason: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: string;
  priority: string;
}

export interface SupportAgent {
  userId: number;
  username: string;
  email: string;
  phone: string;
  isActive: boolean;
  status: string;
  createdAt: string;
}
