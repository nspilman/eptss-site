import { DataTable } from "components/shared/DataTable";
import { useState } from "react";
import * as styles from "./SongsTable.css";

interface SongDatum {
  artist: string;
  title: string;
  round_id: number;
  vote: number;
}

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const headerKeys = ["songTitle", "artist", "roundId", "avgVote"] as const;
  const headers: {
    key: typeof headerKeys[number];
    display: string;
  }[] = [
    {
      key: "songTitle",
      display: "Song Title",
    },
    {
      key: "artist",
      display: "Artist",
    },
    {
      key: "roundId",
      display: "Round Id",
    },
    {
      key: "avgVote",
      display: "Average Vote",
    },
  ];

  const display = allSongsData.map(({ artist, title, round_id, vote }) => ({
    songTitle: title,
    artist,
    roundId: round_id,
    avgVote: vote.toPrecision(3),
  }));

  const [searchString, setSearchString] = useState("");
  const filteredSongs =
    searchString === ""
      ? display
      : display.filter(({ artist, songTitle, roundId }) => {
          return (
            artist.toLowerCase().includes(searchString.toLowerCase()) ||
            songTitle.toLowerCase().includes(searchString.toLowerCase()) ||
            roundId.toString() === searchString.toLowerCase().trim()
          );
        });

  return (
    <div className={styles.container}>
      <h1>All previously submitted songs</h1>
      <input
        placeholder="Search by title, artist or round number"
        className={styles.searchBox}
        onChange={(e) => setSearchString(e.currentTarget.value)}
      />
      <DataTable headers={headers} rows={filteredSongs} />
    </div>
  );
};
