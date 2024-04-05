import { useSupabase } from "components/hooks/useSupabaseClient";
import { AsyncTableQueryDisplay } from "@/components/AsyncTableQueryDisplay";
import { Views } from "@/data-access";
import { roundProvider } from "@/providers/roundProvider";

export const AggregateVoteTable = () => {
  const supabase = useSupabase();
  const getAggregateVote = async () => {
    const { roundId } = await roundProvider();
    const { data, error, status } = await supabase
      .from(Views.VoteResults)
      .select("*")
      .filter("round_id", "eq", roundId);
    return {
      error,
      status,
      data: (
        (data as { title: string; artist: string; average: number }[]) || []
      ).map((vote) => ({ ...vote, average: vote.average.toFixed(2) })),
    };
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
