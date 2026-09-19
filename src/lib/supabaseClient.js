import { createClient } from '@supabase/supabase-js'

// Falls back to the real project so it works out-of-the-box;
// override with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars if you move projects later.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vkuedrqdpixdzlnpskzl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWVkcnFkcGl4ZHpsbnBza3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODE3MDQsImV4cCI6MjEwNTI1NzcwNH0.IQLOpOrElFXT3hCrHsEVK-vkAQfRbTlzVehWckXwdeg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
