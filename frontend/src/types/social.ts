export type Platform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin';

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  maxLength: number;
  connected: boolean;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  mediaUrl?: string;
  hashtags: string[];
  createdAt: string;
}

export interface DailySchedule {
  date: string;
  slots: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: string;
  time: string;
  post: ScheduledPost | null;
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F', maxLength: 2200, connected: false },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#1877F2', maxLength: 63206, connected: false },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000', maxLength: 280, connected: false },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', maxLength: 2200, connected: false },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', maxLength: 3000, connected: false },
];

export const DEFAULT_POSTING_TIMES = ['09:00', '12:00', '17:00', '20:00'];
