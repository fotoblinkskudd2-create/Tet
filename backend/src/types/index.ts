// User types
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  subscriptionTier: 'free' | 'premium' | 'eternal';
  subscriptionExpiresAt: Date | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  subscriptionTier: string;
  subscriptionExpiresAt: Date | null;
}

// Deceased person types
export interface DeceasedPerson {
  id: string;
  userId: string;
  name: string;
  nickname: string | null;
  birthDate: Date | null;
  deathDate: Date | null;
  relationship: string | null;
  profilePhotoUrl: string | null;
  personalitySummary: string | null;
  voiceCharacteristics: VoiceCharacteristics | null;
  favoritePhrases: string[];
  emotionalPatterns: EmotionalPatterns | null;
  dialect: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionAt: Date | null;
}

export interface VoiceCharacteristics {
  tone: string; // 'warm', 'harsh', 'gentle', etc.
  pitch: 'low' | 'medium' | 'high';
  accent: string;
  speechPatterns: string[]; // 'speaks fast', 'uses long pauses', etc.
  fillerWords: string[]; // 'eh', 'liksom', 'typ', etc.
}

export interface EmotionalPatterns {
  happinessTriggers: string[];
  angerTriggers: string[];
  sadnessTriggers: string[];
  humorStyle: string; // 'sarcastic', 'dark', 'silly', etc.
  loveLanguage: string; // 'physical touch', 'words', 'acts of service', etc.
}

// Data source types
export interface DataSource {
  id: string;
  deceasedPersonId: string;
  sourceType: DataSourceType;
  fileName: string | null;
  fileSizeBytes: number | null;
  fileUrl: string | null;
  uploadStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError: string | null;
  messageCount: number;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  processedAt: Date | null;
}

export type DataSourceType =
  | 'whatsapp'
  | 'imessage'
  | 'email'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'voice_memo'
  | 'photos'
  | 'diary'
  | 'other';

// Memory types
export interface Memory {
  id: string;
  deceasedPersonId: string;
  dataSourceId: string | null;
  memoryType: MemoryType;
  content: string;
  contentLanguage: string;
  timestamp: Date | null;
  participants: string[];
  location: string | null;
  emotionDetected: Emotion | null;
  context: string | null;
  mediaUrls: string[];
  embedding: number[] | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

export type MemoryType =
  | 'message'
  | 'email'
  | 'post'
  | 'photo_caption'
  | 'voice_transcript'
  | 'diary_entry'
  | 'other';

export type Emotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'sarcastic'
  | 'loving'
  | 'excited'
  | 'worried'
  | 'neutral'
  | 'playful'
  | 'frustrated';

// Conversation types
export interface Conversation {
  id: string;
  userId: string;
  deceasedPersonId: string;
  title: string | null;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  contextSummary: string | null;
  mood: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  voiceUrl: string | null;
  emotion: Emotion | null;
  memoriesUsed: string[];
  tokensUsed: number | null;
  modelUsed: string | null;
  createdAt: Date;
}

// Voice sample types
export interface VoiceSample {
  id: string;
  deceasedPersonId: string;
  fileUrl: string;
  durationSeconds: number | null;
  transcript: string | null;
  qualityScore: number | null;
  elevenlabsVoiceId: string | null;
  createdAt: Date;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'premium' | 'eternal';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  priceNok: number | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  startedAt: Date;
  expiresAt: Date | null;
  cancelledAt: Date | null;
  metadata: Record<string, any>;
}

// Usage log types
export interface UsageLog {
  id: string;
  userId: string;
  actionType: 'chat_message' | 'voice_generation' | 'data_upload' | 'memory_retrieval';
  tokensUsed: number;
  costNok: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Shared access types
export interface SharedAccess {
  id: string;
  deceasedPersonId: string;
  ownerUserId: string;
  sharedWithUserId: string;
  accessLevel: 'view' | 'chat' | 'edit';
  grantedAt: Date;
  expiresAt: Date | null;
}

// RAG and AI types
export interface RAGContext {
  relevantMemories: Memory[];
  personalityTraits: string[];
  emotionalContext: string;
  conversationHistory: Message[];
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
  generateVoice?: boolean;
  temperature?: number;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  voiceUrl?: string;
  memoriesUsed: Memory[];
}
