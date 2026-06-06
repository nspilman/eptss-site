import type { RoundState } from "../types";
import { STATE_VISUALS } from "../state";

/** Small badge for a round's derived state. */
export function StatePill({ state }: { state: RoundState }) {
  const v = STATE_VISUALS[state];
  return (
    <span
      className={`rounded-sharp px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${v.tint} ${v.text}`}
    >
      {v.label}
    </span>
  );
}
