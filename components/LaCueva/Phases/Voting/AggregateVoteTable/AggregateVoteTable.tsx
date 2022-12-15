import { PostgrestError } from "@supabase/supabase-js";
import { useSupabase } from "components/hooks/useSupabaseClient";
import { AsyncTableQueryDisplay } from "components/shared/AsyncTableQueryDisplay";

type AggregateVoteKey = "title" | "artist" | "average";

type OutstandingVotersReturn = {
  data: Record<AggregateVoteKey, string | number>[];
  error: PostgrestError | null;
  status: number;
};

export const AggregateVoteTable = () => {
  const supabase = useSupabase();
  const getAggregateVote = async () => {
    return (await supabase.rpc(
      "get_aggregate_vote"
    )) as OutstandingVotersReturn;
  };

  const headers = [
    { key: "title" as const, display: "Title" },
    { key: "artist" as const, display: "Artist" },
    { key: "average" as const, display: "Average Vote" },
  ];

  return (
    <AsyncTableQueryDisplay queryFn={getAggregateVote} headers={headers} />
  );
};
