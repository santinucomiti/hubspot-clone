import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface ContactListFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: string | number | string[];
}

export interface ContactList {
  id: string;
  name: string;
  type: 'STATIC' | 'DYNAMIC';
  filters: ContactListFilter[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  lifecycleStage: string;
  companyId?: string | null;
}

export interface CreateContactListRequest {
  name: string;
  type: 'STATIC' | 'DYNAMIC';
  filters?: ContactListFilter[];
}

export interface UpdateContactListRequest {
  name?: string;
  filters?: ContactListFilter[];
}

export async function getContactLists(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<ContactList>> {
  const response = await apiClient.get<PaginatedResponse<ContactList>>(
    '/contact-lists',
    { params },
  );
  return response.data;
}

export async function getContactList(id: string): Promise<ContactList> {
  const response = await apiClient.get<ContactList>(`/contact-lists/${id}`);
  return response.data;
}

export async function createContactList(
  data: CreateContactListRequest,
): Promise<ContactList> {
  const response = await apiClient.post<ContactList>('/contact-lists', data);
  return response.data;
}

export async function updateContactList(
  id: string,
  data: UpdateContactListRequest,
): Promise<ContactList> {
  const response = await apiClient.patch<ContactList>(
    `/contact-lists/${id}`,
    data,
  );
  return response.data;
}

export async function deleteContactList(id: string): Promise<void> {
  await apiClient.delete(`/contact-lists/${id}`);
}

export async function addContactListMembers(
  id: string,
  contactIds: string[],
): Promise<{ count: number }> {
  const response = await apiClient.post<{ count: number }>(
    `/contact-lists/${id}/members`,
    { contactIds },
  );
  return response.data;
}

export async function getContactListContacts(
  id: string,
): Promise<ContactListContact[]> {
  const response = await apiClient.get<ContactListContact[]>(
    `/contact-lists/${id}/contacts`,
  );
  return response.data;
}
