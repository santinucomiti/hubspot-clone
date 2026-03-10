import apiClient from './client';
import type { PaginatedResponse } from './types';

export interface CustomPropertyDefinition {
  id: string;
  name: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN';
  entityType: 'CONTACT' | 'COMPANY';
  options?: string[] | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPropertyValue {
  id: string;
  definitionId: string;
  entityType: 'CONTACT' | 'COMPANY';
  entityId: string;
  value: string;
  definition: CustomPropertyDefinition;
}

export interface CreateDefinitionRequest {
  name: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN';
  entityType: 'CONTACT' | 'COMPANY';
  options?: string[];
  isRequired?: boolean;
}

export interface SetValueRequest {
  definitionId: string;
  entityType: 'CONTACT' | 'COMPANY';
  entityId: string;
  value: string;
}

export async function listDefinitions(entityType?: 'CONTACT' | 'COMPANY'): Promise<PaginatedResponse<CustomPropertyDefinition>> {
  const params = entityType ? `?entityType=${entityType}&limit=100` : '?limit=100';
  const response = await apiClient.get<PaginatedResponse<CustomPropertyDefinition>>(`/custom-properties${params}`);
  return response.data;
}

export async function createDefinition(data: CreateDefinitionRequest): Promise<CustomPropertyDefinition> {
  const response = await apiClient.post<CustomPropertyDefinition>('/custom-properties', data);
  return response.data;
}

export async function deleteDefinition(id: string): Promise<void> {
  await apiClient.delete(`/custom-properties/${id}`);
}

export async function getValues(entityType: 'CONTACT' | 'COMPANY', entityId: string): Promise<CustomPropertyValue[]> {
  const response = await apiClient.get<CustomPropertyValue[]>(`/custom-properties/values/${entityType}/${entityId}`);
  return response.data;
}

export async function setValue(data: SetValueRequest): Promise<CustomPropertyValue> {
  const response = await apiClient.post<CustomPropertyValue>('/custom-properties/values', data);
  return response.data;
}
