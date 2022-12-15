import { useSupabase } from "components/hooks/useSupabaseClient";
import { DataTable } from "components/shared/DataTable";
import { useEffect, useState } from "react";

export const OutstandingVotes = () => {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [outstandingVotes, setOutstandingVotes] = useState<
    {
      title: string;
      artist: string;
      average: number;
    }[]
  >([]);
  useEffect(() => {
    const getOutstandingVoters = async () => {
      setIsLoading(true);
      const { data, error, status } = await supabase.rpc(
        "get_outstanding_voters"
      );
      setOutstandingVotes(data as any);
      setIsLoading(false);
    };
    getOutstandingVoters();
  }, []);

  const headers = [{ key: "email", display: "Email" }];

  return (
    <div>
      outstanding votes: {outstandingVotes.length}
      <DataTable headers={headers} rows={outstandingVotes} />
    </div>
  );
};
