import { createClient } from '@supabase/supabase-js'

// Supabase configuration - these will be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Authentication will not work.')
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase