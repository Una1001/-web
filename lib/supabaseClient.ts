import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// 檢查是否有正確的 Supabase 設定
export const hasSupabase = !!supabaseUrl && !!supabaseKey;


// 命名匯出，允許其他模組條件性使用 Supabase
export const hasSupabase = Boolean(supabaseUrl && supabaseKey);

// const SUPABASE_URL = 'https://lyokorcfaaqobtvtimeu.supabase.co';
// const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual Supabase anon key

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// export const hasSupabase = !!SUPABASE_ANON_KEY;
