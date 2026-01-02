"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, Label, Text } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui";
import { submissionSchema, type SubmissionInput } from "@eptss/data-access/schemas/submission"
import { PageContent } from "@eptss/project-config";
import { useProject } from "../../ProjectContext";
import { MediaUploader, UploadResult } from "@eptss/media-upload";
import { useState } from "react";

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

  const [audioUpload, setAudioUpload] = useState<UploadResult | null>(null);
  const [coverImageUpload, setCoverImageUpload] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      audioFileUrl: "",
      audioFilePath: "",
      coverImageUrl: "",
      coverImagePath: "",
      audioDuration: undefined,
      audioFileSize: undefined,
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
    // Validate that audio has been uploaded
    if (!audioUpload) {
      return { status: "Error" as const, message: "Please upload an audio file" };
    }

    // Add audio file data to formData
    formData.set("audioFileUrl", audioUpload.url);
    formData.set("audioFilePath", audioUpload.path);
    if (audioUpload.fileSize) {
      formData.set("audioFileSize", audioUpload.fileSize.toString());
    }

    // Add cover image data if uploaded
    if (coverImageUpload) {
      formData.set("coverImageUrl", coverImageUpload.url);
      formData.set("coverImagePath", coverImageUpload.path);
    }

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

          {/* Audio Upload */}
          <div className="space-y-2">
            <Label htmlFor="audio-upload">
              Audio File <span className="text-red-500">*</span>
            </Label>
            <Text size="sm" color="muted">
              {song.title !== null ? "Upload your song" : "Upload your cover"}
            </Text>
            <MediaUploader
              bucket="audio-submissions"
              accept="audio/*"
              maxSizeMB={50}
              variant="dropzone"
              showPreview={true}
              onUploadComplete={(results) => {
                if (results.length > 0) {
                  setAudioUpload(results[0]);
                  setUploadError(null);
                  // Update form values
                  form.setValue("audioFileUrl", results[0].url);
                  form.setValue("audioFilePath", results[0].path);
                  if (results[0].fileSize) {
                    form.setValue("audioFileSize", results[0].fileSize);
                  }
                }
              }}
              onUploadError={(error) => {
                setUploadError(error.message);
              }}
            />
            {uploadError && (
              <Text size="sm" color="destructive">{uploadError}</Text>
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="cover-image-upload">
              Cover Art <Text as="span" size="sm" color="muted">(Optional)</Text>
            </Label>
            <Text size="sm" color="muted">
              Upload cover art for your submission (will use your profile picture if not provided)
            </Text>
            <MediaUploader
              bucket="submission-images"
              accept="image/*"
              maxSizeMB={5}
              enableCrop={true}
              variant="dropzone"
              showPreview={true}
              onUploadComplete={(results) => {
                if (results.length > 0) {
                  setCoverImageUpload(results[0]);
                  // Update form values
                  form.setValue("coverImageUrl", results[0].url);
                  form.setValue("coverImagePath", results[0].path);
                }
              }}
            />
          </div>

          <FormBuilder
            fields={getFormFields(song.title !== null)}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !audioUpload} size="full">
            {isLoading ? submitContent.submittingText : submitButtonText}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
