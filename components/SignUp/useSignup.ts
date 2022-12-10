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

  const signupSuccessText = {
    header: `Thank you for signing up for this round of Everyone Plays the Same Song!`,
    body: ` You will get a welcome email with all the information and dates you will
    need.`,
    thankyou: `Thanks for participating`,
  };

  const signupSuccessImage = {
    src: "/welcomeImage.png",
    alt: "Welcome to Everyone Plays the Same Song!",
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
  return {
    signUp,
    signupSuccess: {
      text: signupSuccessText,
      image: signupSuccessImage,
    },
  };
};
