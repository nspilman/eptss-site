import React from "react";
import { PageContainer } from "../shared/PageContainer";
import { SignupForm } from "./SignupForm";
import { SignupEntity, SignupModel } from "./types";
import { SignupSuccess } from "./SignupSuccess";
import { useSupabase } from "../hooks/useSupabaseClient";
import { useSuccessState } from "../hooks/useSuccessState";
import { FormContainer } from "../shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { getIsSuccess } from "../../utils/utils";

interface Props {
  roundId: number;
}

export const SignUp = ({ roundId }: Props) => {
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
      round_id: roundId,
      created_at: createdAt,
    };
  };

  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <FormContainer
        form={<SignupForm onSubmit={onSubmit} roundId={roundId} />}
        successBlock={<SignupSuccess />}
        errorMessage={GENERIC_ERROR_MESSAGE}
        successState={successState}
      />
    </PageContainer>
  );
};
