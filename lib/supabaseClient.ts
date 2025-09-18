import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

// This function creates a Supabase client that can be used in client components.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
