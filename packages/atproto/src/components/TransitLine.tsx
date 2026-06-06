import type { Milestone, Round, RoundState } from "../types";
import { deriveState, STATE_VISUALS } from "../state";
import { formatDate, formatDateTime, timeUntil } from "../format";

/**
 * The round's lifecycle drawn as a transit line: milestones are stations, the
 * current moment is the red "you are here" dot, and the current stretch of
 * track is tinted with the round's state color. Ported from atjam. Pure
 * presentational (a Server Component) — the only motion is a one-shot CSS
 * pulse on the now dot.
 */
type TransitNode =
  | { kind: "origin"; date: string }
  | { kind: "milestone"; label: string; date: string; passed: boolean }
  | { kind: "now" };

function buildNodes(round: Round, now: number): TransitNode[] {
  const sorted = [...round.milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const passedCount = sorted.filter(
    (m) => new Date(m.date).getTime() <= now,
  ).length;

  const nodes: TransitNode[] = [{ kind: "origin", date: round.createdAt }];
  sorted.forEach((m, i) => {
    if (i === passedCount) nodes.push({ kind: "now" });
    nodes.push({
      kind: "milestone",
      label: m.label,
      date: m.date,
      passed: new Date(m.date).getTime() <= now,
    });
  });
  if (passedCount >= sorted.length) nodes.push({ kind: "now" });
  return nodes;
}

export function TransitLine({ round }: { round: Round }) {
  const state = deriveState(round);
  const visual = STATE_VISUALS[state];
  const nodes = buildNodes(round, Date.now());
  const nowPos = nodes.findIndex((n) => n.kind === "now");

  const connectorClass = (i: number): string => {
    if (i === nowPos - 1 || i === nowPos) return visual.track;
    if (i < nowPos) return "bg-ink-3";
    return "bg-line";
  };

  return (
    <div>
      {/* Horizontal signage — wide screens */}
      <ol className="hidden sm:flex sm:items-start">
        {nodes.map((node, i) => {
          const last = i === nodes.length - 1;
          return (
            <li
              key={i}
              className={last ? "flex flex-col" : "flex flex-1 flex-col"}
            >
              <div aria-hidden className="flex h-4 items-center">
                <NodeDot node={node} />
                {!last && <span className={`h-1 flex-1 ${connectorClass(i)}`} />}
              </div>
              <div className="mt-3 pr-5">
                <NodeLabel node={node} state={state} stateText={visual.text} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Vertical strip — narrow screens */}
      <ol className="sm:hidden">
        {nodes.map((node, i) => {
          const last = i === nodes.length - 1;
          return (
            <li key={i} className="flex gap-3">
              <div aria-hidden className="flex w-4 flex-col items-center">
                <span className="mt-0.5">
                  <NodeDot node={node} />
                </span>
                {!last && <span className={`w-1 flex-1 ${connectorClass(i)}`} />}
              </div>
              <div className={last ? "" : "pb-7"}>
                <NodeLabel node={node} state={state} stateText={visual.text} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function NodeDot({ node }: { node: TransitNode }) {
  if (node.kind === "now") {
    return (
      <span className="now-pulse block h-3.5 w-3.5 rounded-full bg-signal ring-2 ring-paper" />
    );
  }
  if (node.kind === "milestone" && !node.passed) {
    return (
      <span className="block h-2.5 w-2.5 rounded-full border-2 border-line bg-paper" />
    );
  }
  return <span className="block h-2.5 w-2.5 rounded-full bg-ink-3" />;
}

function NodeLabel({
  node,
  state,
  stateText,
}: {
  node: TransitNode;
  state: RoundState;
  stateText: string;
}) {
  if (node.kind === "now") {
    return (
      <div className={`text-label uppercase ${stateText}`}>now — {state}</div>
    );
  }
  if (node.kind === "origin") {
    return (
      <div className="text-ink-3">
        <div className="text-label uppercase">created</div>
        <div className="text-xs">{formatDate(node.date)}</div>
      </div>
    );
  }
  return (
    <div>
      <div
        className={`text-label uppercase ${node.passed ? "text-ink-3" : "text-ink-2"}`}
      >
        {node.label}
      </div>
      <div className="text-xs text-ink-3">
        {formatDateTime(node.date)} ({timeUntil(node.date)})
      </div>
    </div>
  );
}

export type { Milestone };
