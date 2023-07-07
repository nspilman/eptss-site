import queries from "queries";
import { Round } from "queries/roundQueries";
import { useEffect, useState } from "react";

export const useGetRoundsDates = () => {
  const [rounds, setRounds] = useState<Round[]>();
  useEffect(() => {
    const getRounds = async () => {
      const { data: rounds } = await queries.round.getCurrentAndFutureRounds();
      setRounds(rounds);
    };
    getRounds();
  }, []);
  const [current, next] = rounds || [undefined, undefined];
  return [current, next];
};
