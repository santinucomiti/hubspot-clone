import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  mjmlSource?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  mjmlSource?: string;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  htmlContent?: string;
  mjmlSource?: string;
}

export async function getEmailTemplates(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<EmailTemplate>> {
  const response = await apiClient.get<PaginatedResponse<EmailTemplate>>(
    '/email-templates',
    { params },
  );
  return response.data;
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
  const response = await apiClient.get<EmailTemplate>(
    `/email-templates/${id}`,
  );
  return response.data;
}

export async function createEmailTemplate(
  data: CreateEmailTemplateRequest,
): Promise<EmailTemplate> {
  const response = await apiClient.post<EmailTemplate>(
    '/email-templates',
    data,
  );
  return response.data;
}

export async function updateEmailTemplate(
  id: string,
  data: UpdateEmailTemplateRequest,
): Promise<EmailTemplate> {
  const response = await apiClient.patch<EmailTemplate>(
    `/email-templates/${id}`,
    data,
  );
  return response.data;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await apiClient.delete(`/email-templates/${id}`);
}
