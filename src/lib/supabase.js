import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://zwowuhfsorfnhmhvoqsm.supabase.co";
const fallbackAnonKey = "sb_publishable_aqqVrDvfsxUFvN_CbfXwMg_3PpS3xw8";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

export { supabaseUrl, supabaseAnonKey };

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function hasSupabaseConfig() {
  return Boolean(supabase);
}
