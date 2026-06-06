import type { EptssData } from "../read";
import { deriveState } from "../state";
import { StatePill } from "./StatePill";
import { TransitLine } from "./TransitLine";

/** The jam header + every round, each with its song, state, and timeline. */
export function RoundList({ data }: { data: EptssData }) {
  return (
    <div>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {data.jam?.name ?? "Everyone Plays the Same Song"}
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">
          {data.jam?.description ??
            "Every round, everyone covers the same song. These rounds and their submissions live as records on the AT Protocol network — read here straight off the source."}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-ink-3">
          {data.did}
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {data.rounds.length === 0 && (
          <p className="text-ink-3">No rounds published yet.</p>
        )}
        {data.rounds.map((r) => {
          const state = deriveState(r.round);
          const song = r.round.subject;
          return (
            <section key={r.uri} className="border-t border-line pt-6">
              <a
                href={`/atproto/round/${r.rkey}`}
                className="group inline-flex flex-wrap items-center gap-3"
              >
                <span className="text-base font-medium group-hover:underline">
                  {r.round.name ?? "Round"}
                </span>
                <StatePill state={state} />
              </a>
              {song?.title && (
                <p className="mt-1 text-sm text-ink-2">
                  {song.title} <span className="text-ink-3">— {song.artist}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-ink-3">
                {r.submissions.length} submission
                {r.submissions.length === 1 ? "" : "s"}
              </p>
              <div className="mt-5">
                <TransitLine round={r.round} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
