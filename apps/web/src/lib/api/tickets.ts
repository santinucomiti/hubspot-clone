import apiClient from './client';
import type { PaginatedResponse } from './types';

// --- Types ---

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketSource = 'EMAIL' | 'MANUAL' | 'FORM';

export interface TicketOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TicketContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TicketCompany {
  id: string;
  name: string;
}

export interface TicketDeal {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  source: TicketSource;
  statusChangedAt: string;
  owner: TicketOwner | null;
  contact: TicketContact | null;
  company: TicketCompany | null;
  deal: TicketDeal | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  author: TicketCommentAuthor;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketStatusHistoryEntry {
  id: string;
  ticketId: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
  changedAt: string;
  changedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  statusHistory: TicketStatusHistoryEntry[];
}

export interface TicketDashboard {
  openCount: number;
  avgResolutionTimeHours: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface CreateTicketRequest {
  subject: string;
  description?: string;
  priority?: TicketPriority;
  category?: string;
  source?: TicketSource;
  ownerId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  category?: string;
  ownerId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  ownerId?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateCommentRequest {
  body: string;
  isInternal?: boolean;
}

// --- API Functions ---

export async function getTickets(
  params?: TicketQueryParams,
): Promise<PaginatedResponse<Ticket>> {
  const response = await apiClient.get<PaginatedResponse<Ticket>>('/tickets', {
    params,
  });
  return response.data;
}

export async function getTicket(id: string): Promise<TicketDetail> {
  const response = await apiClient.get<TicketDetail>(`/tickets/${id}`);
  return response.data;
}

export async function createTicket(data: CreateTicketRequest): Promise<Ticket> {
  const response = await apiClient.post<Ticket>('/tickets', data);
  return response.data;
}

export async function updateTicket(
  id: string,
  data: UpdateTicketRequest,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(`/tickets/${id}`, data);
  return response.data;
}

export async function deleteTicket(id: string): Promise<void> {
  await apiClient.delete(`/tickets/${id}`);
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(`/tickets/${id}/status`, {
    status,
  });
  return response.data;
}

export async function getTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  const response = await apiClient.get<TicketComment[]>(
    `/tickets/${ticketId}/comments`,
  );
  return response.data;
}

export async function addTicketComment(
  ticketId: string,
  data: CreateCommentRequest,
): Promise<TicketComment> {
  const response = await apiClient.post<TicketComment>(
    `/tickets/${ticketId}/comments`,
    data,
  );
  return response.data;
}

export async function getTicketDashboard(): Promise<TicketDashboard> {
  const response = await apiClient.get<TicketDashboard>('/tickets/dashboard');
  return response.data;
}
