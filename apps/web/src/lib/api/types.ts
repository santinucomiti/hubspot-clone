export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DashboardData {
  dealsByStage: { stage: string; count: number; amount: number }[];
  recentActivities: {
    id: string;
    type: string;
    subject: string;
    createdAt: string;
    createdBy: { firstName: string; lastName: string };
  }[];
  upcomingTasks: {
    id: string;
    subject: string;
    dueAt: string;
    contactName?: string;
  }[];
  ticketSummary: {
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
  };
  campaignStats: {
    totalSent: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
}
