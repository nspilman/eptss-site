import { useSupabase } from "components/hooks/useSupabaseClient";
import { Tables, Views } from "queries";
import { useEffect, useState } from "react";
import { PhaseMgmtService } from "services/PhaseMgmtService";

export const Celebration = () => {
  const supabase = useSupabase();
  const [submissions, setSubmissions] = useState();
  useEffect(() => {
    const getSubmissions = async () => {
      const { roundId } = await PhaseMgmtService.build();
      const { data, error, status } = await supabase
        .from(Tables.Submissions)
        .select("*")
        .filter("round_id", "eq", roundId);
      setSubmissions(data);
    };
    getSubmissions();
  }, []);
  return <div>{JSON.stringify(submissions)}</div>;
};
