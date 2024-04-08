"use server";

import { Views } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const getClient = async () => {
  const cookieHeaders = await cookies();
  const client = await createClient(cookieHeaders);
  return client;
};

const getSubmissions = async (id: number) => {
  const client = await getClient();

  const { data } = await client
    .from(Views.PublicSubmissions)
    .select("*")
    .filter("round_id", "eq", id);
  return data?.map((val) => ({
    artist: val.artist || "",
    created_at: val.created_at || "",
    round_id: val.round_id || -1,
    soundcloud_url: val.soundcloud_url || "",
    title: val.title || "",
    username: val.username || "",
  }));
};

export const submissionService = { getSubmissions };
