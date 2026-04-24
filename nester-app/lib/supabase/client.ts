import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
