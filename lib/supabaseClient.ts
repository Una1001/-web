import { createClient } from '@supabase/supabase-js'

// Uses NEXT_PUBLIC_* so it can be used in client components
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(url, anonKey)

export const hasSupabase = Boolean(url && anonKey)
