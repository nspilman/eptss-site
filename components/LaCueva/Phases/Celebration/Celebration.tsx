import { useSupabase } from "components/hooks/useSupabaseClient";
import { Tables } from "@/data-access";
import { useEffect, useState } from "react";
import { roundProvider } from "@/providers/roundProvider";

export const Celebration = () => {
  const supabase = useSupabase();
  const [submissions, setSubmissions] = useState<any>();
  useEffect(() => {
    const getSubmissions = async () => {
      const { roundId } = await roundProvider();
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
