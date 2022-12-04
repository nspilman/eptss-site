import { PageContainer } from "components/shared/PageContainer";
import { SongsTable } from "./SongsTable";

interface SongDatum {
  artist: string;
  title: string;
  round_id: number;
  vote: number;
  isWinningSong: boolean;
}

export const Reporting = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  return (
    <PageContainer title="Reporting">
      <SongsTable allSongsData={allSongsData} />
    </PageContainer>
  );
};
