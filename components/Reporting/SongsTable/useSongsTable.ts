import { useState } from "react";

export interface SongDatum {
  artist: string;
  title: string;
  round_id: number;
  vote: number;
  isWinningSong: boolean;
}

export const useSongTable = (allSongsData: SongDatum[]) => {
  const headerKeys = [
    "songTitle",
    "artist",
    "roundId",
    "avgVote",
    "isWinningSong",
  ] as const;
  type Headerkey = typeof headerKeys[number];

  const [searchString, setSearchString] = useState("");

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const allSongsDisplay = allSongsData.map(
    ({ artist, title, round_id, vote, isWinningSong }) => ({
      songTitle: title,
      artist: capitalizeFirstLetter(artist),
      roundId: round_id,
      avgVote: vote.toPrecision(3),
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
    {
      key: "isWinningSong",
      display: "Won the vote?",
    },
  ];

  return { headers, rows: filteredSongs, setSearchString };
};
