"use client";
import { DataTable } from "components/shared/DataTable";
import { SongDatum, useSongTable } from "./useSongsTable";

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const { headers, rows, setSearchString } = useSongTable(allSongsData);
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-fraunces text-white font-bold pb-3">
        All previously submitted songs
      </h1>
      <input
        placeholder="Search by title, artist or round number"
        onChange={(e) => setSearchString(e.currentTarget.value)}
        className="mb-8 px-8"
      />
      <DataTable headers={headers} rows={rows} />
    </div>
  );
};
