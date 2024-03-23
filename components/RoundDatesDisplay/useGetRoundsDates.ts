import queries, { getCurrentAndFutureRounds } from "queries";

export const getRoundsDates = async () => {
  const { data: rounds } = await getCurrentAndFutureRounds();
  const [current, next] = rounds || [undefined, undefined];
  return [current, next];
};
