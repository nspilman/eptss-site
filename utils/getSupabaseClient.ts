import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
export const getSupabaseClient = () => {
  // might not want to do this - it might call createClient way too often
  return createClient(supabaseUrl || "", supabaseKey || "");
};
