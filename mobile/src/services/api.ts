import axios from 'axios';

// Backend API URL - change for production
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// ONBOARDING
// ============================================================================

export interface OnboardingRequest {
  chaos_level: number;
  primary_goal: string;
  current_situation: string;
  has_did: boolean;
  debt_amount?: number;
  days_until_crisis?: number;
}

export interface OnboardingResponse {
  user_id: string;
  message: string;
  initial_assessment: string;
  recommended_path: string;
}

export const onboardUser = async (
  data: OnboardingRequest
): Promise<OnboardingResponse> => {
  const response = await api.post('/onboard/', data);
  return response.data;
};

// ============================================================================
// LEARNING SESSIONS
// ============================================================================

export interface SessionStartRequest {
  user_id: string;
}

export interface SessionStartResponse {
  session_id: string;
  message: string;
}

export interface NextModuleResponse {
  module_id: string;
  skill_category: string;
  skill_specific: string;
  estimated_duration_min: number;
  content_type: string;
  content_data: any;
  message: string;
}

export interface SessionCompleteRequest {
  session_id: string;
  completion_rate: number;
  self_assessment?: number;
}

export const startSession = async (
  data: SessionStartRequest
): Promise<SessionStartResponse> => {
  const response = await api.post('/session/start', data);
  return response.data;
};

export const getNextModule = async (
  sessionId: string
): Promise<NextModuleResponse> => {
  const response = await api.get(`/session/next-module?session_id=${sessionId}`);
  return response.data;
};

export const logInteraction = async (eventData: any) => {
  const response = await api.post('/session/interaction', eventData);
  return response.data;
};

export const completeSession = async (data: SessionCompleteRequest) => {
  const response = await api.post('/session/complete', data);
  return response.data;
};

// ============================================================================
// BEHAVIORAL ANALYSIS
// ============================================================================

export interface BehavioralEventRequest {
  user_id: string;
  session_id?: string;
  event_type: string;
  event_data: any;
}

export interface CurrentStateResponse {
  cognitive_load: number;
  state_classification: string;
  learning_window_optimal: boolean;
  detected_part_id?: string;
  recommendation: string;
}

export const logBehavioralEvent = async (data: BehavioralEventRequest) => {
  const response = await api.post('/behavioral/event', data);
  return response.data;
};

export const getCurrentState = async (
  userId: string
): Promise<CurrentStateResponse> => {
  const response = await api.get(`/behavioral/current-state?user_id=${userId}`);
  return response.data;
};

// ============================================================================
// DASHBOARD
// ============================================================================

export interface ConsequenceDashboard {
  learning_hours_total: number;
  learning_hours_this_week: number;
  skills_acquired: string[];
  current_skill_market_value: number;
  debt_amount?: number;
  debt_change_this_week?: number;
  days_until_next_payment?: number;
  continue_current_path: any;
  give_up_projection: any;
}

export interface ProgressDashboard {
  days_active: number;
  total_sessions: number;
  total_learning_minutes: number;
  modules_completed: number;
  current_streak_days: number;
  skills_by_category: Record<string, string[]>;
  average_cognitive_load: number;
  optimal_learning_windows: string[];
  detected_parts?: string[];
}

export const getConsequences = async (
  userId: string
): Promise<ConsequenceDashboard> => {
  const response = await api.get(`/dashboard/consequences/${userId}`);
  return response.data;
};

export const getProgress = async (
  userId: string
): Promise<ProgressDashboard> => {
  const response = await api.get(`/dashboard/progress/${userId}`);
  return response.data;
};

export default api;
