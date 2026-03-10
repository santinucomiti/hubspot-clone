import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  lifecycleStage: 'SUBSCRIBER' | 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER';
  ownerId: string;
  owner: { id: string; firstName: string; lastName: string; email: string };
  companyId: string | null;
  company: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  lifecycleStage?: string;
  ownerId?: string;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  lifecycleStage?: string;
  companyId?: string;
}

export interface UpdateContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  lifecycleStage?: string;
  ownerId?: string;
  companyId?: string | null;
}

export interface BulkContactAction {
  ids: string[];
  action: 'assignOwner' | 'updateLifecycleStage' | 'delete';
  ownerId?: string;
  lifecycleStage?: string;
}

export async function getContacts(params: ContactListParams = {}): Promise<PaginatedResponse<Contact>> {
  const response = await apiClient.get<PaginatedResponse<Contact>>('/contacts', { params });
  return response.data;
}

export async function getContact(id: string): Promise<Contact> {
  const response = await apiClient.get<Contact>(`/contacts/${id}`);
  return response.data;
}

export async function createContact(data: CreateContactData): Promise<Contact> {
  const response = await apiClient.post<Contact>('/contacts', data);
  return response.data;
}

export async function updateContact(id: string, data: UpdateContactData): Promise<Contact> {
  const response = await apiClient.patch<Contact>(`/contacts/${id}`, data);
  return response.data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contacts/${id}`);
}

export async function bulkContactAction(data: BulkContactAction): Promise<{ count: number }> {
  const response = await apiClient.post<{ count: number }>('/contacts/bulk', data);
  return response.data;
}
