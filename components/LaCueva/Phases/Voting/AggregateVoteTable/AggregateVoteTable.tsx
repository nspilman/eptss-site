import { useSupabase } from "components/hooks/useSupabaseClient";
import { DataTable } from "components/shared/DataTable";
import { useEffect, useState } from "react";

export const AggregateVoteTable = () => {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [aggregateVote, setAggregateVote] = useState<
    {
      title: string;
      artist: string;
      average: number;
    }[]
  >([]);
  useEffect(() => {
    const getAggregateVote = async () => {
      setIsLoading(true);
      const { data, error, status } = await supabase.rpc("get_aggregate_vote");
      setAggregateVote(data as any);
      setIsLoading(false);
    };
    getAggregateVote();
  }, []);

  const headers = [
    { key: "title", display: "Title" },
    { key: "artist", display: "Artist" },
    { key: "average", display: "Average Vote" },
  ];

  return (
    <div>
      <DataTable headers={headers} rows={aggregateVote} />
    </div>
  );
};
