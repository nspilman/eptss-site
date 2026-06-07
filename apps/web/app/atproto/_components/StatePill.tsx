import { Badge } from '@eptss/ui';
import type { RoundState } from '@eptss/atproto';

/** A round's derived state, as an EPTSS badge. */
const STATE: Record<RoundState, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  'in-progress': {
    label: 'In progress',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  closed: {
    label: 'Closed',
    className: 'border-gray-700 bg-gray-800/60 text-gray-400',
  },
};

export function StatePill({ state }: { state: RoundState }) {
  const s = STATE[state];
  return (
    <Badge variant="outline" className={s.className}>
      {s.label}
    </Badge>
  );
}
