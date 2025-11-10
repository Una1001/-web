import { createClient } from '@supabase/supabase-js';

// 使用環境變數（來自 .env.local）建立 Supabase client
// 使用空字串預設以避免 build 時的非空斷言問題
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 單一命名匯出 hasSupabase：其他模組可用來判斷是否啟用 Supabase
export const hasSupabase = Boolean(supabaseUrl && supabaseKey);

// 若要用硬編碼 key（僅於開發），可以改為下列方式：
// const SUPABASE_URL = 'https://...';
// const SUPABASE_ANON_KEY = '...';
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
