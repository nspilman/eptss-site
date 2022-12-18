import { DataTable } from "components/shared/DataTable";

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
}

const headers = [
  {
    key: "artist",
    display: "Artist",
  },
  { key: "title", display: "Title" },
  { key: "average", display: "Average Vote" },
  { key: "vote", display: "Your Vote" },
  { key: "delta", display: "Delta" },
] as const;

export const Profile = ({ voteSummary, profileSummary }: Props) => {
  return (
    <div>
      {profileSummary.email}
      <DataTable rows={voteSummary} headers={headers} />
    </div>
  );
};
