"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui";
import { submissionSchema, type SubmissionInput } from "@eptss/data-access/schemas/submission"
import { PageContent } from "@eptss/project-config";
import { useProject } from "../../ProjectContext";

interface Props {
  roundId: number;
  hasSubmitted: boolean;
  song: {
    title: string;
    artist: string;
  };
  dateStrings: {
    coverClosesLabel: string;
    listeningPartyLabel: string;
  };
  submitCover: (formData: FormData) => Promise<FormReturn>;
  submitContent: PageContent['submit'];
}

const getFormFields = (isOriginal: boolean): FieldConfig[] => [
  {
    type: "input",
    name: "soundcloudUrl",
    label: "SoundCloud URL",
    placeholder: "https://soundcloud.com/your-username/your-track",
    inputType: "url",
    description: isOriginal ? "Link to your song on SoundCloud" : "Link to your cover on SoundCloud",
  },
  {
    type: "textarea",
    name: "coolThingsLearned",
    label: "Cool Things Learned",
    placeholder: isOriginal ? "What did you learn while making this song?" : "What did you learn while making this cover?",
    description: "Share your learning experience",
  },
  {
    type: "textarea",
    name: "toolsUsed",
    label: "Tools Used",
    placeholder: isOriginal ? "What tools did you use to make this song?" : "What tools did you use to make this cover?",
    description: "Share your tech stack",
  },
  {
    type: "textarea",
    name: "happyAccidents",
    label: "Happy Accidents",
    placeholder: isOriginal ? "What happy accidents occurred while making this song?" : "What happy accidents occurred while making this cover?",
    description: "Share your serendipitous moments",
  },
  {
    type: "textarea",
    name: "didntWork",
    label: "What Didn't Work",
    placeholder: "What didn't work out as planned?",
    description: "Share your learning opportunities",
  },
];

export const SubmitPage = ({
  roundId,
  hasSubmitted,
  song,
  dateStrings,
  submitCover,
  submitContent,
}: Props) => {
  const { projectSlug } = useProject();
  const { coverClosesLabel, listeningPartyLabel } = dateStrings;

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      soundcloudUrl: "",
      coolThingsLearned: "",
      toolsUsed: "",
      happyAccidents: "",
      didntWork: "",
      roundId
    },
    mode: "onChange",
    reValidateMode: "onChange"
  })

  const successMessage = submitContent.successMessage;

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    const result = await submitCover(formData)

    if (result.status === "Error") {
      return result
    }

    return { status: "Success" as const, message: successMessage }
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    successMessage,
  })

  if (hasSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-4">Thank you for your submission!</h1>
        <p className="mb-2">Congratulations on your hard work!</p>
        <p>Please join us for the virtual listening party on {listeningPartyLabel}.</p>
      </motion.div>
    )
  }

  // Use template for form title
  const formTitle = song.title
    ? submitContent.formTitleWithSong
        .replace('{{songTitle}}', song.title)
        .replace('{{songArtist}}', song.artist)
    : submitContent.formTitleNoSong;

  const formDescription = `${submitContent.formDescriptionPrefix} ${coverClosesLabel}`;

  const submitButtonText = submitContent.submitButtonText;

  return (
    <FormWrapper
      title={formTitle}
      description={formDescription}
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <input type="hidden" name="roundId" value={roundId} />
          <FormBuilder
            fields={getFormFields(song.title !== null)}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} size="full">
            {isLoading ? submitContent.submittingText : submitButtonText}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
