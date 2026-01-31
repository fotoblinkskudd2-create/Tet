// Auto-generated Supabase types - regenerate with: npm run db:generate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'normie' | 'rod_pille' | 'moderator' | 'admin'
export type SubscriptionTier = 'free' | 'elite'
export type VoteType = 'up' | 'down'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          bio: string | null
          role: UserRole
          red_pill_score: number
          lies_exposed_count: number
          created_at: string
          updated_at: string
          is_banned: boolean
          is_shadow_banned: boolean
          stripe_customer_id: string | null
          subscription_tier: SubscriptionTier
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          red_pill_score?: number
          lies_exposed_count?: number
          created_at?: string
          updated_at?: string
          is_banned?: boolean
          is_shadow_banned?: boolean
          stripe_customer_id?: string | null
          subscription_tier?: SubscriptionTier
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          red_pill_score?: number
          lies_exposed_count?: number
          created_at?: string
          updated_at?: string
          is_banned?: boolean
          is_shadow_banned?: boolean
          stripe_customer_id?: string | null
          subscription_tier?: SubscriptionTier
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          source_url: string
          media_urls: Json
          tags: string[]
          ai_tags: string[]
          lie_score: number | null
          lie_analysis: Json | null
          upvotes: number
          downvotes: number
          red_pill_score: number
          controversial_factor: number
          is_flagged: boolean
          flag_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          source_url: string
          media_urls?: Json
          tags?: string[]
          ai_tags?: string[]
          lie_score?: number | null
          lie_analysis?: Json | null
          upvotes?: number
          downvotes?: number
          red_pill_score?: number
          controversial_factor?: number
          is_flagged?: boolean
          flag_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          source_url?: string
          media_urls?: Json
          tags?: string[]
          ai_tags?: string[]
          lie_score?: number | null
          lie_analysis?: Json | null
          upvotes?: number
          downvotes?: number
          red_pill_score?: number
          controversial_factor?: number
          is_flagged?: boolean
          flag_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          upvotes: number
          downvotes: number
          created_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_id?: string | null
          content: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
          content?: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          is_deleted?: boolean
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          vote_type: VoteType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          vote_type: VoteType
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          vote_type?: VoteType
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          post_id: string | null
          comment_id: string | null
          reason: string
          ai_spam_score: number | null
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          post_id?: string | null
          comment_id?: string | null
          reason: string
          ai_spam_score?: number | null
          status?: ReportStatus
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          post_id?: string | null
          comment_id?: string | null
          reason?: string
          ai_spam_score?: number | null
          status?: ReportStatus
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: SubscriptionStatus
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status?: SubscriptionStatus
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: SubscriptionStatus
          current_period_end?: string
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          amount: number
          stripe_payment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount: number
          stripe_payment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number
          stripe_payment_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
      rss_sources: {
        Row: {
          id: string
          name: string
          url: string
          is_active: boolean
          last_fetched: string | null
        }
        Insert: {
          id?: string
          name: string
          url: string
          is_active?: boolean
          last_fetched?: string | null
        }
        Update: {
          id?: string
          name?: string
          url?: string
          is_active?: boolean
          last_fetched?: string | null
        }
      }
      known_lies: {
        Row: {
          id: string
          party: string
          claim: string
          truth: string
          source: string
          category: string
        }
        Insert: {
          id?: string
          party: string
          claim: string
          truth: string
          source: string
          category: string
        }
        Update: {
          id?: string
          party?: string
          claim?: string
          truth?: string
          source?: string
          category?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_red_pill_score: {
        Args: { post_id: string }
        Returns: number
      }
      get_trending_posts: {
        Args: { limit_count: number; offset_count: number }
        Returns: Database['public']['Tables']['posts']['Row'][]
      }
    }
    Enums: {
      user_role: UserRole
      subscription_tier: SubscriptionTier
      vote_type: VoteType
      report_status: ReportStatus
      subscription_status: SubscriptionStatus
    }
  }
}

// Utility types
export type User = Database['public']['Tables']['users']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type RssSource = Database['public']['Tables']['rss_sources']['Row']
export type KnownLie = Database['public']['Tables']['known_lies']['Row']

export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']

// Extended types with relations
export interface PostWithAuthor extends Post {
  author: User
  comment_count?: number
}

export interface CommentWithAuthor extends Comment {
  author: User
  replies?: CommentWithAuthor[]
}

export interface LieAnalysis {
  lie_score: number
  summary: string
  claims: {
    claim: string
    verdict: 'true' | 'false' | 'misleading' | 'unverifiable'
    explanation: string
    sources: string[]
  }[]
  ai_reasoning: string
}
