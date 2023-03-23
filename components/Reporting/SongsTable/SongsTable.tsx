import { Heading, Input, Stack } from "@chakra-ui/react";
import { DataTable } from "components/shared/DataTable";
import { SongDatum, useSongTable } from "./useSongsTable";

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const { headers, rows, setSearchString } = useSongTable(allSongsData);
  return (
    <Stack alignItems="center">
      <Heading as="h1" size="lg" pb="3">
        All previously submitted songs
      </Heading>
      <Input
        placeholder="Search by title, artist or round number"
        onChange={(e) => setSearchString(e.currentTarget.value)}
        mb="8"
      />
      <DataTable headers={headers} rows={rows} />
    </Stack>
  );
};
