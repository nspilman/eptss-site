interface SongDatum {
  artist: string;
  title: string;
  roundId: number;
  vote: number;
}

export const Reporting = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  console.log({ allSongsData });
  return (
    <div>
      {allSongsData.map(({ artist, title, round_id: roundId, vote }) => {
        return (
          <div key={artist + title + roundId}>
            <span>{title}</span> by <span>{artist}</span>- round{" "}
            <span>{roundId}</span> vote:{" "}
            <span>{Math.round(vote * 100) / 100}</span>
          </div>
        );
      })}
    </div>
  );
};
