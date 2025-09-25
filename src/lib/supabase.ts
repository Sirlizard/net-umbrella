import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jcorwewtnihdvkuuwzui.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjb3J3ZXd0bmloZHZrdXV3enVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mzk4NDQsImV4cCI6MjA3NDQxNTg0NH0.hkCccjV6mGpz4_mgMOuRPHp6wWaJ4JwoOitDWIsNM9Q'

export const supabase = createClient(supabaseUrl, supabaseKey)
