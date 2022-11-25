import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_DB_SERVER;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
export const getSupabaseClient = () => {
  return createClient(supabaseUrl || "", supabaseKey || "");
};
