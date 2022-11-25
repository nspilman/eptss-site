import React from "react";
import { PageContainer } from "../shared/PageContainer";
import { SignupForm } from "./SignupForm";
import { SignupEntity, SignupModel } from "./types";
import { SignupSuccess } from "./SignupSuccess";
import { useSupabase } from "../../hooks/useSupabaseClient";
import { useSuccessState } from "../../hooks/useSuccessState";
import { FormContainer } from "../shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { getIsSuccess } from "../../utils/utils";
export const SignUp = () => {
  const currentRound = 16;

  const [successState, setSuccessState] = useSuccessState();

  const supabase = useSupabase();

  const onSubmit = async (signupModel: SignupModel) => {
    const signupEntity = convertModelToEntity(signupModel);
    const { status } = await supabase.from("sign_ups").insert(signupEntity);
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
      artist,
      song_title: songTitle,
      youtube_link: youtubeLink,
      additional_comments: additionalComments,
      round_id: currentRound,
      created_at: createdAt,
    };
  };

  return (
    <PageContainer title={`Sign up for round ${currentRound}`}>
      <FormContainer
        form={<SignupForm onSubmit={onSubmit} roundId={currentRound} />}
        successBlock={<SignupSuccess />}
        errorMessage={GENERIC_ERROR_MESSAGE}
        successState={successState}
      />
    </PageContainer>
  );
};
