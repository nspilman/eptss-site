import { useForm } from "react-hook-form";
import * as styles from "./Form.css";
import React from "react";
import { FormInput } from "./FormInput/ForInput";
import { createClient } from "@supabase/supabase-js";
import { SignupEntity, SignupModel } from "../types";
import Link from "next/link";
import { useNavOptions } from "../../../hooks/useNavOptions";

interface Props {
  onSubmit: (signupModel: SignupModel) => void;
  roundId: number;
}

export const Form = ({ onSubmit, roundId }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupModel>();

  const { howItWorks } = useNavOptions();

  enum FormField {
    Email = "email",
    Name = "name",
    SongTitle = "songTitle",
    Artist = "artist",
    YoutubeLink = "youtubeLink",
    AdditionalComments = "additionalComments",
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* TODO - this should be outside the form */}
      <h1 className={styles.title}>
        Sign Up for Everyone Plays the Same Song round {roundId}!
      </h1>
      <div className={styles.descriptionWrapper}>
        <p>Sign up with your name, email and the song you want to cover!</p>
        <Link href={howItWorks}> Full rules here</Link>
      </div>
      <div className={styles.formFieldWrapper}>
        <FormInput
          label="Your Name"
          placeholder="Name"
          register={register}
          field={FormField.Name}
          errors={errors}
        />
        <FormInput
          label="Your Email"
          placeholder="Email"
          register={register}
          field={FormField.Email}
          errors={errors}
          type="email"
        />
        <FormInput
          label="Title"
          placeholder="Song Title"
          register={register}
          field={FormField.SongTitle}
          errors={errors}
          size="large"
        />
        <FormInput
          label="Artist"
          placeholder="Artist"
          register={register}
          field={FormField.Artist}
          errors={errors}
          size="large"
        />
        <FormInput
          label="Youtube Link"
          placeholder="Youtube Link"
          register={register}
          field={FormField.YoutubeLink}
          errors={errors}
          size="large"
        />
        <FormInput
          label="Additional Comments"
          placeholder="Anything else you'd like to comment"
          register={register}
          field={FormField.AdditionalComments}
          errors={errors}
          size="large"
          optional
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
