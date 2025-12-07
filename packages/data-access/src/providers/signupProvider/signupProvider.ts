"use server";

import { signupUserWithoutSong as signupUserWithoutSongService } from "../../services/signupService";
import { FormReturn } from "../../types";

export const signupProvider = async () => {
  return {
    signupUserWithoutSong: signupUserWithoutSongService,
  };
};

/**
 * Direct export for convenience
 * Sign up a user for a round without song selection
 */
export async function signupUserWithoutSong(props: {
  projectId: string;
  roundId: number;
  userId: string;
  additionalComments?: string
}): Promise<FormReturn> {
  return signupUserWithoutSongService(props);
}
