import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Singleton for browser/client
let browserClient: TypedSupabaseClient | null = null

export function createBrowserClient(): TypedSupabaseClient {
  if (browserClient) return browserClient

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })

  return browserClient
}

// Server-side client (for API routes)
export function createServerClient(): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

// For server components in Next.js
export function createServerComponentClient(cookieStore: any): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  } as any)
}

// Export the default client for convenience
export const supabase = createBrowserClient()
