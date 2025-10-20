"use client";
import { DataTable } from "@/components/DataTable";
import { SongDatum, useSongTable } from "./useSongsTable";
import { Input } from "@/components/ui/input";

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const { headers, rows, setSearchString } = useSongTable(allSongsData);
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-fraunces text-white font-bold pb-3">
        All previously submitted songs
      </h1>
      <Input
        placeholder="Search by title, artist or round number"
        onChange={(e) => setSearchString(e.currentTarget.value)}
        className="mb-8 flex h-9 w-full rounded-md border border-[var(--color-border-primary)] bg-transparent px-3 py-1 text-sm text-[var(--color-primary)] shadow-xs transition-colors placeholder:text-[var(--color-secondary)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]"
      />
      <DataTable headers={headers} rows={rows} maxHeight={600}/>
    </div>
  );
};
