import type { Round } from '@eptss/atproto';
import {
  deriveState,
  formatDate,
  formatDateTime,
  timeUntil,
} from '@eptss/atproto';

/**
 * A round's lifecycle as a milestone line: milestones are stations, the current
 * moment is the accent "now" dot, and the stretch of track up to it is tinted with
 * the EPTSS accent. Pure server component; restyled from the atjam transit line to
 * the EPTSS dark theme.
 */
type Node =
  | { kind: 'origin'; date: string }
  | { kind: 'milestone'; label: string; date: string; passed: boolean }
  | { kind: 'now' };

function buildNodes(round: Round, now: number): Node[] {
  const sorted = [...round.milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const passedCount = sorted.filter(
    (m) => new Date(m.date).getTime() <= now,
  ).length;

  const nodes: Node[] = [{ kind: 'origin', date: round.createdAt }];
  sorted.forEach((m, i) => {
    if (i === passedCount) nodes.push({ kind: 'now' });
    nodes.push({
      kind: 'milestone',
      label: m.label,
      date: m.date,
      passed: new Date(m.date).getTime() <= now,
    });
  });
  if (passedCount >= sorted.length) nodes.push({ kind: 'now' });
  return nodes;
}

export function Timeline({ round }: { round: Round }) {
  const state = deriveState(round);
  const nodes = buildNodes(round, Date.now());
  const nowPos = nodes.findIndex((n) => n.kind === 'now');

  const connector = (i: number): string => {
    if (i === nowPos - 1 || i === nowPos)
      return 'bg-[var(--color-accent-primary)]';
    if (i < nowPos) return 'bg-gray-600';
    return 'bg-gray-800';
  };

  return (
    <div>
      {/* Horizontal — wide screens */}
      <ol className="hidden sm:flex sm:items-start">
        {nodes.map((node, i) => {
          const last = i === nodes.length - 1;
          return (
            <li
              key={i}
              className={last ? 'flex flex-col' : 'flex flex-1 flex-col'}
            >
              <div aria-hidden className="flex h-4 items-center">
                <Dot node={node} />
                {!last && <span className={`h-0.5 flex-1 ${connector(i)}`} />}
              </div>
              <div className="mt-3 pr-5">
                <NodeLabel node={node} state={state} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Vertical — narrow screens */}
      <ol className="sm:hidden">
        {nodes.map((node, i) => {
          const last = i === nodes.length - 1;
          return (
            <li key={i} className="flex gap-3">
              <div aria-hidden className="flex w-4 flex-col items-center">
                <span className="mt-0.5">
                  <Dot node={node} />
                </span>
                {!last && <span className={`w-0.5 flex-1 ${connector(i)}`} />}
              </div>
              <div className={last ? '' : 'pb-6'}>
                <NodeLabel node={node} state={state} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Dot({ node }: { node: Node }) {
  if (node.kind === 'now') {
    return (
      <span className="block h-3.5 w-3.5 rounded-full bg-[var(--color-accent-primary)] ring-2 ring-gray-900" />
    );
  }
  if (node.kind === 'milestone' && !node.passed) {
    return (
      <span className="block h-2.5 w-2.5 rounded-full border-2 border-gray-700 bg-gray-900" />
    );
  }
  return <span className="block h-2.5 w-2.5 rounded-full bg-gray-500" />;
}

function NodeLabel({ node, state }: { node: Node; state: string }) {
  if (node.kind === 'now') {
    return (
      <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-accent-primary)]">
        now — {state}
      </div>
    );
  }
  if (node.kind === 'origin') {
    return (
      <div className="text-gray-500">
        <div className="text-[11px] font-medium uppercase tracking-wide">
          created
        </div>
        <div className="text-xs">{formatDate(node.date)}</div>
      </div>
    );
  }
  return (
    <div>
      <div
        className={`text-[11px] font-medium uppercase tracking-wide ${
          node.passed ? 'text-gray-500' : 'text-gray-300'
        }`}
      >
        {node.label}
      </div>
      <div className="text-xs text-gray-500">
        {formatDateTime(node.date)} ({timeUntil(node.date)})
      </div>
    </div>
  );
}
