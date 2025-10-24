import { getAllSongs } from "../../services/songsService";

interface Props {
  roundIdToRemove?: number;
}

export const reportingProvider = async ({ roundIdToRemove = -1 }: Props) => {
  const allSongsData = await getAllSongs({ roundIdToRemove });

  return { allSongsData };
};
