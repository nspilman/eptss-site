import { DataTable } from "components/shared/DataTable";
import * as styles from "./Profile.css";

export interface VoteSummary {
  artist: string;
  title: string;
  average: number;
  id: number;
  round_id: number;
  email: string;
  vote: number;
  delta: number;
}

export interface SignUp {
  song: {
    title: string;
    artist: string;
  };
  roundId: number;
  averageVote: number;
}

interface Props {
  voteSummary: VoteSummary[];
  profileSummary: {
    email: string;
  };
  signups: {
    roundId: number;
    title: string;
    artist: string;
    isWinningSong: string;
  }[];
  submissions: {
    round_id: number;
    title: string;
    artist: string;
    soundcloud_url: string;
  }[];
}

const headers = [
  {
    key: "artist",
    display: "Artist",
    sortable: true,
  },
  { key: "title", display: "Title", sortable: true },
  { key: "average", display: "Average Vote, sortable: true" },
  { key: "vote", display: "Your Vote", sortable: true },
  { key: "delta", display: "Delta", sortable: true },
  { key: "round_id", display: "Round", sortable: true },
] as const;

const signupHeaders = [
  {
    key: "artist",
    display: "Artist",
    sortable: true,
  },
  { key: "title", display: "Title", sortable: true },
  { key: "isWinningSong", display: "isWinningSong", sortable: true },
  { key: "roundId", display: "Round", sortable: true },
] as const;

const submissionHeaders = [
  { key: "round_id", display: "Round id", sortable: true },
  {
    key: "artist",
    display: "Artist",
    sortable: true,
  },
  { key: "title", display: "Title", sortable: true },
  { key: "soundcloud_url", display: "Soundcloud Link", sortable: true },
] as const;

export const Profile = ({
  voteSummary,
  profileSummary,
  signups,
  submissions,
}: Props) => {
  return (
    <div className={styles.container}>
      {profileSummary?.email}
      <DataTable rows={voteSummary} headers={headers} />
      <DataTable rows={signups} headers={signupHeaders} />
      <DataTable rows={submissions} headers={submissionHeaders} />
    </div>
  );
};
