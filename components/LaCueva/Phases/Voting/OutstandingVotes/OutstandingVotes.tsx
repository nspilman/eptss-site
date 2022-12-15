import { PostgrestError } from "@supabase/supabase-js";
import { useSupabase } from "components/hooks/useSupabaseClient";
import { AsyncTableQueryDisplay } from "components/shared/AsyncTableQueryDisplay/AsyncTableQueryDisplay";

export const OutstandingVotes = () => {
  const supabase = useSupabase();

  type OutstandingVoterKeys = "email";

  type OutstandingVotersReturn = {
    data: Record<OutstandingVoterKeys, string | number>[];
    error: PostgrestError | null;
    status: number;
  };

  const getOutstandingVoters = async () => {
    return (await supabase.rpc(
      "get_outstanding_voters"
    )) as OutstandingVotersReturn;
  };

  const headers = [{ key: "email" as const, display: "Email" }];

  return (
    <AsyncTableQueryDisplay
      headers={headers}
      queryFn={getOutstandingVoters}
      summaryFunction={{
        summaryFunction: "sum",
        label: "Outstanding Vote Count",
      }}
    />
  );
};
