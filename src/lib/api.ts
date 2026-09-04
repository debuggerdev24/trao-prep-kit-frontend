import type {
  AuthResponse,
  InterviewKit,
  GenerateKitResponse,
  User,
} from '../types/kit';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let authToken: string | null = null;

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('trao_token');
}

export function setToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('trao_token', token);
    } else {
      localStorage.removeItem('trao_token');
    }
  }
}

export function getToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('trao_token');
  }
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

// --- Auth Endpoints ---
export async function apiRegister(email: string, password: string, name: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me');
}

// --- Kit Endpoints ---
export async function apiListKits(): Promise<{ kits: InterviewKit[] }> {
  return request<{ kits: InterviewKit[] }>('/kits');
}

export async function apiGetKit(id: string): Promise<{ kit: InterviewKit }> {
  return request<{ kit: InterviewKit }>(`/kits/${id}`);
}

export async function apiGenerateKit(
  jd: string,
  company_url: string,
  days: number
): Promise<GenerateKitResponse> {
  return request<GenerateKitResponse>('/kits/generate', {
    method: 'POST',
    body: JSON.stringify({ jd, company_url, days }),
  });
}

export async function apiUpdateKit(
  id: string,
  updatedData: Partial<InterviewKit>
): Promise<{ kit: InterviewKit }> {
  return request<{ kit: InterviewKit }>(`/kits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updatedData),
  });
}

export async function apiDeleteKit(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/kits/${id}`, {
    method: 'DELETE',
  });
}

export async function apiRegenerateSection(
  id: string,
  payload: {
    section: 'company_brief' | 'schedule' | 'category';
    category?: string;
    currentKit: InterviewKit;
  }
): Promise<{ kit: InterviewKit }> {
  return request<{ kit: InterviewKit }>(`/kits/${id}/regenerate-section`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Practice Progress Endpoints ---
export interface PracticeProgressSummary {
  kitId: string;
  totalCards: number;
  cardsCovered: number;
  cardsRemaining: number;
  needReviewCount: number;
  goodCount: number;
  masteredCount: number;
  totalSessions: number;
  lastSessionAt?: string;
  cardRatings: Record<string, {
    cardId: string;
    confidence: 'low' | 'medium' | 'high';
    rating: 1 | 2 | 3;
    reviewCount: number;
    lastReviewedAt: string;
  }>;
  recommendedCardOrder: string[];
}

export async function apiGetPracticeProgress(kitId: string): Promise<PracticeProgressSummary> {
  return request<PracticeProgressSummary>(`/kits/${kitId}/practice`);
}

export async function apiSavePracticeProgress(
  kitId: string,
  ratings: Array<{ cardId: string; confidence: 'low' | 'medium' | 'high' | 1 | 2 | 3 }>
): Promise<PracticeProgressSummary> {
  return request<PracticeProgressSummary>(`/kits/${kitId}/practice`, {
    method: 'POST',
    body: JSON.stringify({ ratings }),
  });
}
