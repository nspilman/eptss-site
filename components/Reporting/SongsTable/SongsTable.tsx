import { Input, Stack } from "@chakra-ui/react";
import { DataTable } from "components/shared/DataTable";
import { SongDatum, useSongTable } from "./useSongsTable";

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const { headers, rows, setSearchString } = useSongTable(allSongsData);
  return (
    <Stack alignItems="center">
      <h1 className="font-fraunces text-white font-bold pb-3">
        All previously submitted songs
      </h1>
      <Input
        placeholder="Search by title, artist or round number"
        onChange={(e) => setSearchString(e.currentTarget.value)}
        mb="8"
      />
      <DataTable headers={headers} rows={rows} />
    </Stack>
  );
};
