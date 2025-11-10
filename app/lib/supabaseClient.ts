import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lyokorcfaaqobtvtimeu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('Supabase key is not set. Please configure NEXT_PUBLIC_SUPABASE_KEY in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const hasSupabase = Boolean(supabaseUrl && supabaseKey)