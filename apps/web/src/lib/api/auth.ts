import apiClient, { setTokens } from './client';
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  const { accessToken, refreshToken } = response.data.tokens;
  setTokens(accessToken, refreshToken);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  const { accessToken, refreshToken } = response.data.tokens;
  setTokens(accessToken, refreshToken);
  return response.data;
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/auth/forgot-password',
    data,
  );
  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/auth/reset-password',
    data,
  );
  return response.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/users/me');
  return response.data;
}

export async function updateProfile(
  data: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'avatarUrl'>>,
): Promise<AuthUser> {
  const response = await apiClient.patch<AuthUser>('/users/me', data);
  return response.data;
}
