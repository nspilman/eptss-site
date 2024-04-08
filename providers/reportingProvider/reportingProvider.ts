import { roundService, votesService } from "@/data-access";
import { songsService } from "@/data-access/songsService";

interface Props {
  roundIdToRemove?: number;
}

export const reportingProvider = async ({ roundIdToRemove = -1 }: Props) => {
  const allSongsData = await songsService.getAllSongs({ roundIdToRemove });

  return { allSongsData };
};
