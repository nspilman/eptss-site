import React from "react";
import { Form } from "../../shared/Form/Form";
import { SignupModel } from "../types";
import Link from "next/link";
import { useNavOptions } from "../../hooks/useNavOptions";
import { yourEmail, yourName } from "../../shared/Form/fieldValues";

interface Props {
  onSubmit: (signupModel: SignupModel) => void;
  roundId: number;
}

export const SignupForm = ({ onSubmit, roundId }: Props) => {
  const { howItWorks } = useNavOptions();

  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const formFields = [
    yourName,
    yourEmail,
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
    {
      label: "Additional Comments",
      placeholder: "Additional Comments",
      field: "additionalComments" as const,
      size: "large" as const,
      optional: true,
    },
  ];

  return (
    <Form
      onSubmit={onSubmit}
      title={title}
      description={
        <>
          <p>Sign up with your name, email and the song you want to cover!</p>
          <Link href={howItWorks}> Full rules here</Link>
        </>
      }
      fields={formFields}
    />
  );
};
