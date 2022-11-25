import { SupabaseClient } from "@supabase/supabase-js";

export const getCurrentRound = async (
  supabase: SupabaseClient<any, "public", any>
) => {
  const {
    data: roundData,
    error,
    status,
  } = await supabase
    .from("round_metadata")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (roundData) {
    const roundId = roundData[0].id;
    if (typeof roundId === "number") {
      return { roundId, status, error };
    }
  }
  return { roundId: -1, status, error };
};
