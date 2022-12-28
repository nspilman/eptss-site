import { DataTable } from "components/shared/DataTable";
import { Phase } from "services/PhaseMgmtService";
import * as styles from "./RoundSummary.css";

export interface VoteResults {
  title: string;
  artist: string;
  average: number;
}
[];

export interface RoundMetadata {
  artist: string;
  title: string;
  playlistUrl: string;
  submitter: string;
}

interface Props {
  voteResults: VoteResults[];
  signupCount: number;
  phase: Phase | "Complete";
  roundId: number;
  metadata: RoundMetadata;
  submissionCount: number;
}

const voteResultsHeaders = [
  {
    key: "title",
    display: "Title",
  },
  { key: "artist", display: "Artist" },
  { key: "average", display: "Average Vote" },
] as const;

export const RoundSummary = ({
  voteResults,
  signupCount,
  phase,
  roundId,
  metadata: { artist, title, playlistUrl, submitter },
  submissionCount,
}: Props) => {
  const roundSummaryHeaders: {
    display: string;
    key: "phase" | "signupCount" | "submissionCount";
  }[] = [
    {
      display: "Current Phase",
      key: "phase" as const,
    },
    {
      display: "Signup Count",
      key: "signupCount" as const,
    },
  ];

  const submissionCountHeader = {
    display: "Submission Count",
    key: "submissionCount" as const,
  };
  const roundIsComplete = phase === "Complete";

  if (roundIsComplete) {
    roundSummaryHeaders.push(submissionCountHeader);
  }

  const roundSummary = [
    {
      signupCount: `${signupCount} signups`,
      phase: `Current phase: ${phase}`,
      submissionCount: `${submissionCount} submissions`,
    },
  ];
  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Round {roundId} Info</h1>
      <h2>
        {title} by {artist}
      </h2>
      {phase === "Complete" && <span>Submitted by: {submitter}</span>}
      <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
      <div
        className={styles.playlistWrapper}
        dangerouslySetInnerHTML={{ __html: playlistUrl }}
      ></div>
      <DataTable
        title={"Voting breakdown"}
        headers={voteResultsHeaders}
        rows={voteResults}
      />
    </div>
  );
};
