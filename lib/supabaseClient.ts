import { createClient } from '@supabase/supabase-js'

// 使用 NEXT_PUBLIC_ 前綴，使前端（client components）也能讀到
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const hasSupabase = Boolean(url && anonKey)

export const supabase = createClient(url, anonKey)

export default supabase
