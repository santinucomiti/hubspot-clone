import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    name: string;
    subject: string;
  };
  campaignLists?: {
    contactList: {
      id: string;
      name: string;
      type: string;
    };
  }[];
}

export interface CampaignAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  contactListIds: string[];
  scheduledAt?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  templateId?: string;
  contactListIds?: string[];
}

export async function getCampaigns(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Campaign>> {
  const response = await apiClient.get<PaginatedResponse<Campaign>>(
    '/campaigns',
    { params },
  );
  return response.data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
  return response.data;
}

export async function createCampaign(
  data: CreateCampaignRequest,
): Promise<Campaign> {
  const response = await apiClient.post<Campaign>('/campaigns', data);
  return response.data;
}

export async function updateCampaign(
  id: string,
  data: UpdateCampaignRequest,
): Promise<Campaign> {
  const response = await apiClient.patch<Campaign>(`/campaigns/${id}`, data);
  return response.data;
}

export async function sendCampaign(
  id: string,
  scheduledAt?: string,
): Promise<Campaign> {
  const response = await apiClient.post<Campaign>(`/campaigns/${id}/send`, {
    scheduledAt,
  });
  return response.data;
}

export async function cancelCampaign(id: string): Promise<Campaign> {
  const response = await apiClient.post<Campaign>(`/campaigns/${id}/cancel`);
  return response.data;
}

export async function getCampaignAnalytics(
  id: string,
): Promise<CampaignAnalytics> {
  const response = await apiClient.get<CampaignAnalytics>(
    `/campaigns/${id}/analytics`,
  );
  return response.data;
}
