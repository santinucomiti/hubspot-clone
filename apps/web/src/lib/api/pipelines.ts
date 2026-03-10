import apiClient from './client';

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  pipelineId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStageInput {
  name: string;
  position: number;
  probability?: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface CreatePipelineInput {
  name: string;
  isDefault?: boolean;
  stages: CreateStageInput[];
}

export interface UpdatePipelineInput {
  name?: string;
  isDefault?: boolean;
}

export interface UpdatePipelineStagesInput {
  stages: (CreateStageInput & { id?: string })[];
}

export async function listPipelines(): Promise<Pipeline[]> {
  const response = await apiClient.get<Pipeline[]>('/pipelines');
  return response.data;
}

export async function getPipeline(id: string): Promise<Pipeline> {
  const response = await apiClient.get<Pipeline>(`/pipelines/${id}`);
  return response.data;
}

export async function createPipeline(data: CreatePipelineInput): Promise<Pipeline> {
  const response = await apiClient.post<Pipeline>('/pipelines', data);
  return response.data;
}

export async function updatePipeline(
  id: string,
  data: UpdatePipelineInput,
): Promise<Pipeline> {
  const response = await apiClient.patch<Pipeline>(`/pipelines/${id}`, data);
  return response.data;
}

export async function deletePipeline(id: string): Promise<void> {
  await apiClient.delete(`/pipelines/${id}`);
}
