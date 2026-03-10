import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  ownerId: string;
  owner: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface CreateCompanyData {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
}

export interface UpdateCompanyData {
  name?: string;
  domain?: string | null;
  industry?: string | null;
  size?: string | null;
  ownerId?: string;
}

export async function getCompanies(params: CompanyListParams = {}): Promise<PaginatedResponse<Company>> {
  const response = await apiClient.get<PaginatedResponse<Company>>('/companies', { params });
  return response.data;
}

export async function getCompany(id: string): Promise<Company> {
  const response = await apiClient.get<Company>(`/companies/${id}`);
  return response.data;
}

export async function createCompany(data: CreateCompanyData): Promise<Company> {
  const response = await apiClient.post<Company>('/companies', data);
  return response.data;
}

export async function updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
  const response = await apiClient.patch<Company>(`/companies/${id}`, data);
  return response.data;
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`);
}
