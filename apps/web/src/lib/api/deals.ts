import apiClient from './client';
import type { PaginatedResponse } from './types';
import type { PipelineStage } from './pipelines';

export interface DealContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DealCompany {
  id: string;
  name: string;
  domain: string | null;
}

export interface DealOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  currency: string;
  closeDate: string | null;
  lostReason: string | null;
  stageId: string;
  pipelineId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  stage?: PipelineStage;
  owner?: DealOwner;
  contacts?: DealContact[];
  companies?: DealCompany[];
}

export interface DealQueryParams {
  search?: string;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateDealInput {
  name: string;
  amount?: number;
  currency?: string;
  closeDate?: string;
  stageId: string;
  pipelineId: string;
  ownerId?: string;
  contactIds?: string[];
  companyIds?: string[];
}

export interface UpdateDealInput {
  name?: string;
  amount?: number;
  currency?: string;
  closeDate?: string;
  stageId?: string;
  ownerId?: string;
  lostReason?: string;
  contactIds?: string[];
  companyIds?: string[];
}

export interface ForecastEntry {
  period: string;
  weightedAmount: number;
  totalAmount: number;
  dealCount: number;
}

export interface ForecastResponse {
  pipelineId: string;
  period: string;
  entries: ForecastEntry[];
  totalWeighted: number;
  totalUnweighted: number;
}

export async function listDeals(
  params?: DealQueryParams,
): Promise<PaginatedResponse<Deal>> {
  const response = await apiClient.get<PaginatedResponse<Deal>>('/deals', {
    params,
  });
  return response.data;
}

export async function getDeal(id: string): Promise<Deal> {
  const response = await apiClient.get<Deal>(`/deals/${id}`);
  return response.data;
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  const response = await apiClient.post<Deal>('/deals', data);
  return response.data;
}

export async function updateDeal(
  id: string,
  data: UpdateDealInput,
): Promise<Deal> {
  const response = await apiClient.patch<Deal>(`/deals/${id}`, data);
  return response.data;
}

export async function deleteDeal(id: string): Promise<void> {
  await apiClient.delete(`/deals/${id}`);
}

export async function moveDealStage(
  id: string,
  stageId: string,
): Promise<Deal> {
  const response = await apiClient.patch<Deal>(`/deals/${id}/stage`, {
    stageId,
  });
  return response.data;
}

export async function getForecast(
  pipelineId?: string,
  period: 'month' | 'quarter' | 'year' = 'quarter',
): Promise<ForecastResponse> {
  const response = await apiClient.get<ForecastResponse>('/deals/forecast', {
    params: { pipelineId, period },
  });
  return response.data;
}
