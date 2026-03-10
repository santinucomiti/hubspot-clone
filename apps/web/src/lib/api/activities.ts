import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface Activity {
  id: string;
  type: 'NOTE' | 'EMAIL' | 'CALL' | 'MEETING' | 'TASK';
  subject: string;
  body?: string | null;
  occurredAt: string;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  contactId?: string | null;
  contact?: { id: string; firstName: string; lastName: string; email: string } | null;
  companyId?: string | null;
  company?: { id: string; name: string } | null;
  dealId?: string | null;
  ticketId?: string | null;
  duration?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface CreateActivityRequest {
  type: 'NOTE' | 'EMAIL' | 'CALL' | 'MEETING' | 'TASK';
  subject: string;
  body?: string;
  occurredAt?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  ticketId?: string;
  duration?: number;
  startAt?: string;
  endAt?: string;
  dueAt?: string;
  completedAt?: string;
}

export interface ActivityQuery {
  page?: number;
  limit?: number;
  sort?: string;
  type?: string;
  entityType?: 'contact' | 'company' | 'deal' | 'ticket';
  entityId?: string;
}

export async function listActivities(query: ActivityQuery = {}): Promise<PaginatedResponse<Activity>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  const response = await apiClient.get<PaginatedResponse<Activity>>(`/activities?${params}`);
  return response.data;
}

export async function getActivity(id: string): Promise<Activity> {
  const response = await apiClient.get<Activity>(`/activities/${id}`);
  return response.data;
}

export async function createActivity(data: CreateActivityRequest): Promise<Activity> {
  const response = await apiClient.post<Activity>('/activities', data);
  return response.data;
}
