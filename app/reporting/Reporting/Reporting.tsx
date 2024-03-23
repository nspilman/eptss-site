import { PageTitle } from "@/components/PageTitle";
import { SongsTable } from "./SongsTable";
import { SongDatum } from "./SongsTable/useSongsTable";

export const Reporting = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  return (
    <>
      <PageTitle title="Reporting" />
      <SongsTable allSongsData={allSongsData} />
    </>
  );
};
