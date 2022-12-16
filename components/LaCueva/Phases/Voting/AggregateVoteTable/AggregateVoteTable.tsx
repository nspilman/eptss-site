import { useSupabase } from "components/hooks/useSupabaseClient";
import { AsyncTableQueryDisplay } from "components/shared/AsyncTableQueryDisplay";

export const AggregateVoteTable = () => {
  const supabase = useSupabase();
  const getAggregateVote = async () => {
    const { data, error, status } = await supabase.rpc("get_aggregate_vote");
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
