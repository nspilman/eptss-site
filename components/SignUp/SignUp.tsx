import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PageContainer } from "../shared/PageContainer/PageContainer";
import { Form } from "./Form";
import { SignupEntity, SignupModel } from "./types";
import * as styles from "./Signup.css";
import { SignupSuccess } from "./SignupSuccess";
export const SignUp = () => {
  const currentRound = 16;

  const supabaseUrl = process.env.NEXT_PUBLIC_DB_SERVER;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  const supabase = createClient(supabaseUrl || "", supabaseKey || "");

  const [signupSubmissionResponse, setSignupSubmissionResponse] = useState<
    "success" | "error"
  >();

  const onSubmit = async (signupModel: SignupModel) => {
    const signupEntity = convertModelToEntity(signupModel);
    const { status } = await supabase.from("sign_ups").insert(signupEntity);
    if (status === 200 || status === 201) {
      setSignupSubmissionResponse("success");
    } else {
      setSignupSubmissionResponse("error");
    }
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
      <div className={styles.formWrapper}>
        {signupSubmissionResponse !== "success" ? (
          <Form onSubmit={onSubmit} roundId={currentRound} />
        ) : (
          <SignupSuccess />
        )}
        {signupSubmissionResponse === "error" &&
          "An error has occurred. Please try again and/or hit Nate up"}
      </div>
    </PageContainer>
  );
};
