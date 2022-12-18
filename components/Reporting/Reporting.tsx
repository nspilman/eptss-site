import { PageContainer } from "components/shared/PageContainer";
import { SongsTable } from "./SongsTable";
import { SongDatum } from "./SongsTable/useSongsTable";

export const Reporting = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  return (
    <PageContainer title="Reporting">
      <SongsTable allSongsData={allSongsData} />
    </PageContainer>
  );
};
