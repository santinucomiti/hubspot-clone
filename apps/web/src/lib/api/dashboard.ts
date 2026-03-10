import apiClient from './client';
import type { DashboardData } from './types';

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>('/dashboard');
  return response.data;
}
