// Maps a round's database primary key to the round number we want to show.
// Add an entry here when a DB id no longer matches the displayed round number
// (e.g. after introducing a new round type that consumed an id).
const ROUND_ID_TO_DISPLAY_NUMBER: Record<number, number> = {
  332: 30,
};

export function getDisplayRoundNumber(roundId: number): number {
  return ROUND_ID_TO_DISPLAY_NUMBER[roundId] ?? roundId;
}
