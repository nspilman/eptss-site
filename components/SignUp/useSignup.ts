import { useSupabase } from "components/hooks/useSupabaseClient";
import { additionalComments } from "components/shared/fieldValues";
import { getIsSuccess } from "utils";
import { SignupEntity, SignupModel } from "./types";

export const useSignup = (roundId: number, userId: string) => {
  const supabase = useSupabase();

  const signUp = async (
    signupModel: Pick<SignupModel, "additionalComments" | "createdAt"> &
      Partial<Exclude<SignupModel, "additionalComments" | "createdAt">>
  ) => {
    if (
      !signupModel.artist ||
      !signupModel.songTitle ||
      !signupModel.youtubeLink
    ) {
      signupModel.artist = "No Artist Submitted";
      signupModel.songTitle = "No Song Submitted";
      signupModel.youtubeLink = "";
    }
    const signupEntity = convertModelToEntity(
      signupModel as SignupModel,
      roundId,
      userId
    );
    const { status } = await supabase.rpc("signup", signupEntity);
    return getIsSuccess(status) ? "success" : "error";
  };

  const signupSuccessText = {
    header: `Thank you for signing up for this round of Everyone Plays the Same Song!`,
    body: ` You will get a welcome email with all the information and dates you will
    need.`,
    thankyou: `Thanks for participating`,
  };

  const signupSuccessImage = {
    src: "/welcomeimage.png",
    alt: "Welcome to Everyone Plays the Same Song!",
    blurSrc: "welcome-image-blur.png",
  };

  const fields = [
    {
      label: "Song title",
      placeholder: "Song title",
      field: "songTitle" as const,
      size: "large" as const,
    },
    {
      label: "Artist",
      placeholder: "artist",
      field: "artist" as const,
      size: "large" as const,
    },
    {
      label: "Youtube link",
      placeholder: "Youtube link",
      field: "youtubeLink" as const,
      size: "large" as const,
    },
    additionalComments,
  ].filter((field) => {
    roundId === 21
      ? ["songTitle", "artist", "youtubeLink"].includes(field.field)
      : true;
  });

  // const if

  return {
    signUp,
    fields,
    signupSuccess: {
      text: signupSuccessText,
      image: signupSuccessImage,
    },
  };
};

const convertModelToEntity = (
  {
    createdAt,
    songTitle,
    artist,
    youtubeLink,
    additionalComments,
  }: SignupModel,
  roundId: number,
  userId: string
): SignupEntity => {
  return {
    artist_name: artist,
    song_title: songTitle,
    youtube_link: youtubeLink,
    additional_comments: additionalComments,
    round_id: roundId,
    created_at: createdAt,
    user_id: userId,
  };
};
