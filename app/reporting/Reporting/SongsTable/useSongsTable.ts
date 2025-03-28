import { useState } from "react";

export interface SongDatum {
  artist: string;
  title: string;
  round_id: number;
  average: number;
  isWinningSong: boolean;
}

export const useSongTable = (allSongsData: SongDatum[]) => {
  const headerKeys = [
    "songTitle",
    "artist",
    "roundId",
    "average",
    "isWinningSong",
  ] as const;
  type Headerkey = typeof headerKeys[number];

  const [searchString, setSearchString] = useState("");

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const allSongsDisplay = allSongsData.map(
    ({ artist, title, round_id, average, isWinningSong }) => ({
      songTitle: title,
      artist: capitalizeFirstLetter(artist),
      roundId: round_id,
      average,
      isWinningSong: isWinningSong.toString(),
    })
  );

  const filteredSongs =
    searchString === ""
      ? allSongsDisplay
      : allSongsDisplay.filter(({ artist, songTitle, roundId }) => {
          return (
            artist.toLowerCase().includes(searchString.toLowerCase()) ||
            songTitle.toLowerCase().includes(searchString.toLowerCase()) ||
            roundId.toString() === searchString.toLowerCase().trim()
          );
        });

  const headers: {
    key: Headerkey;
    label: string;
    sortable: true;
  }[] = [
    {
      key: "songTitle",
      label: "Song Title",
      sortable: true,
    },
    {
      key: "artist",
      label: "Artist",
      sortable: true,
    },
    {
      key: "roundId",
      label: "Round Id",
      sortable: true,
    },
    {
      key: "average",
      label: "Average Vote",
      sortable: true,
    },
    {
      key: "isWinningSong",
      label: "Covered?",
      sortable: true,
    },
  ];

  return { headers, rows: filteredSongs, setSearchString };
};
