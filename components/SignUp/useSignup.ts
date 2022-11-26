import { useSupabase } from "components/hooks/useSupabaseClient";
import { getIsSuccess } from "utils";
import { SignupEntity, SignupModel } from "./types";

export const useSignup = (
  roundId: number,
  setSuccessState: (successState: "error" | "success") => void
) => {
  const supabase = useSupabase();

  const signUp = async (signupModel: SignupModel) => {
    const signupEntity = convertModelToEntity(signupModel);
    const { status } = await supabase.rpc("signup", signupEntity);
    setSuccessState(getIsSuccess(status) ? "success" : "error");
  };

  const convertModelToEntity = ({
    createdAt,
    email,
    name,
    songTitle,
    artist,
    youtubeLink,
    additionalComments,
  }: SignupModel): SignupEntity => {
    return {
      email,
      name,
      artist_name: artist,
      song_title: songTitle,
      youtube_link: youtubeLink,
      additional_comments: additionalComments,
      round_id: roundId,
      created_at: createdAt,
    };
  };
  return { signUp };
};
