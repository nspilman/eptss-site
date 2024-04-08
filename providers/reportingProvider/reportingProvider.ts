import { getAllSongs } from "@/data-access/songsService";

interface Props {
  roundIdToRemove?: number;
}

export const reportingProvider = async ({ roundIdToRemove = -1 }: Props) => {
  const allSongsData = await getAllSongs({ roundIdToRemove });

  return { allSongsData };
};
