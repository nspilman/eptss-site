import { cookies } from "next/headers";
import { createClient } from "./server";

export const getSession = async () => {
  const cookieStore = await cookies();
  const supabaseClient = await createClient(cookieStore);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return session;
};
