"use server";

import { Views } from "@/types";
import { createClient } from "@/utils/supabase/server";

const getClient = async () => {
  const client = await createClient();
  return client;
};

export const getSubmissions = async (id: number) => {
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
