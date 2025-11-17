import { createClient } from '@supabase/supabase-js';

// 使用環境變數（來自 .env.local）建立 Supabase client
// 使用空字串預設以避免 build 時的非空斷言問題
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 檢查是否有正確的 Supabase 設定
export const hasSupabase = !!supabaseUrl && !!supabaseKey;


// const SUPABASE_URL = 'https://lyokorcfaaqobtvtimeu.supabase.co';
// const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual Supabase anon key

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
