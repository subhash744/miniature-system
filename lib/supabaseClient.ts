import { createClient } from '@supabase/supabase-js'

// Supabase configuration - these will be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qgarjmbtowecwcihhtom.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYXJqbWJ0b3dlY3djaWhodG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQ1MDgsImV4cCI6MjA3NzM0MDUwOH0.8pDLa0xQjw0Ywy5hzy5y2JwitGMESKtonJrF65tZxK4'

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Authentication will not work.')
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase