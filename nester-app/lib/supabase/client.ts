import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('Supabase URL is missing or invalid. Please update .env.local')
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey!)
}
