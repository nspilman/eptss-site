"use server";

import { createClient } from "@/utils/supabase/server";

export const signout = async () => {
  "use server";
  const supabase = await createClient();
  return supabase.auth.signOut();
};

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string;};

