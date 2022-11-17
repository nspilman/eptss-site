import { createClient } from "@supabase/supabase-js";

export const useSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_DB_SERVER;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl || "", supabaseKey || "");
  return supabase;
};
