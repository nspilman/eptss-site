import { useSupabase } from "components/hooks/useSupabaseClient";
import { AsyncTableQueryDisplay } from "components/shared/AsyncTableQueryDisplay";
import { PhaseMgmtService } from "services/PhaseMgmtService";

export const AggregateVoteTable = () => {
  const supabase = useSupabase();
  const getAggregateVote = async () => {
    const { roundId } = await PhaseMgmtService.build();
    const { data, error, status } = await supabase
      .from("vote_results")
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
