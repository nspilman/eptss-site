"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, FormLabel, Text, Textarea } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui";
import { submissionSchema, type SubmissionInput } from "@eptss/data-access/schemas/submission"
import { PageContent, SubmissionFormConfig, validateSubmissionForm } from "@eptss/project-config";
import { useProject } from "../../ProjectContext";
import { MediaUploader, UploadResult } from "@eptss/media-upload";
import { BUCKETS } from "@eptss/bucket-storage";
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
  submissionFormConfig: SubmissionFormConfig;
}

// Default labels and placeholders for narrative fields
const narrativeFieldDefaults: Record<string, { label: string; placeholder: (isOriginal: boolean) => string; description: string }> = {
  coolThingsLearned: {
    label: "Cool Things Learned",
    placeholder: (isOriginal) => isOriginal ? "What did you learn while making this song?" : "What did you learn while making this cover?",
    description: "Share your learning experience",
  },
  toolsUsed: {
    label: "Tools Used",
    placeholder: (isOriginal) => isOriginal ? "What tools did you use to make this song?" : "What tools did you use to make this cover?",
    description: "Share your tech stack",
  },
  happyAccidents: {
    label: "Happy Accidents",
    placeholder: (isOriginal) => isOriginal ? "What happy accidents occurred while making this song?" : "What happy accidents occurred while making this cover?",
    description: "Share your serendipitous moments",
  },
  didntWork: {
    label: "What Didn't Work",
    placeholder: () => "What didn't work out as planned?",
    description: "Share your learning opportunities",
  },
};

const getFormFields = (isOriginal: boolean, config: SubmissionFormConfig): FieldConfig[] => {
  const fields: FieldConfig[] = [];
  const narrativeFieldNames = ['coolThingsLearned', 'toolsUsed', 'happyAccidents', 'didntWork'] as const;

  for (const fieldName of narrativeFieldNames) {
    const fieldConfig = config.fields[fieldName];
    if (fieldConfig.enabled) {
      const defaults = narrativeFieldDefaults[fieldName];
      fields.push({
        type: "textarea",
        name: fieldName,
        label: fieldConfig.label || defaults.label,
        placeholder: fieldConfig.placeholder || defaults.placeholder(isOriginal),
        description: fieldConfig.description || defaults.description,
      });
    }
  }

  return fields;
};

export const SubmitPage = ({
  roundId,
  hasSubmitted,
  song,
  dateStrings,
  submitCover,
  submitContent,
  submissionFormConfig,
}: Props) => {
  const { projectSlug } = useProject();
  const { coverClosesLabel, listeningPartyLabel } = dateStrings;

  const [audioUpload, setAudioUpload] = useState<UploadResult | null>(null);
  const [coverImageUpload, setCoverImageUpload] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioResetKey, setAudioResetKey] = useState(0);
  const [coverResetKey, setCoverResetKey] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get field configs for easier access
  const audioConfig = submissionFormConfig.fields.audioFile;
  const coverImageConfig = submissionFormConfig.fields.coverImage;
  const lyricsConfig = submissionFormConfig.fields.lyrics;

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      audioFileUrl: "",
      audioFilePath: "",
      coverImageUrl: "",
      coverImagePath: "",
      audioDuration: undefined,
      audioFileSize: undefined,
      lyrics: "",
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
    // Build field values for validation
    const lyrics = form.getValues("lyrics");
    const fieldValues = [
      { fieldName: "audioFile", value: audioUpload?.url },
      { fieldName: "coverImage", value: coverImageUpload?.url },
      { fieldName: "lyrics", value: lyrics },
      { fieldName: "coolThingsLearned", value: form.getValues("coolThingsLearned") },
      { fieldName: "toolsUsed", value: form.getValues("toolsUsed") },
      { fieldName: "happyAccidents", value: form.getValues("happyAccidents") },
      { fieldName: "didntWork", value: form.getValues("didntWork") },
    ];

    // Validate required fields and required groups
    const validation = validateSubmissionForm(submissionFormConfig, fieldValues);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return { status: "Error" as const, message: validation.errors[0] };
    }
    setValidationErrors([]);

    // Add audio file data to formData if uploaded
    if (audioUpload) {
      formData.set("audioFileUrl", audioUpload.url);
      formData.set("audioFilePath", audioUpload.path);
      if (audioUpload.fileSize) {
        formData.set("audioFileSize", audioUpload.fileSize.toString());
      }
    }

    // Add cover image data if uploaded
    if (coverImageUpload) {
      formData.set("coverImageUrl", coverImageUpload.url);
      formData.set("coverImagePath", coverImageUpload.path);
    }

    // Add lyrics if provided
    if (lyrics) {
      formData.set("lyrics", lyrics);
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

  // Determine if audio is required based on config
  const isAudioRequired = audioConfig.required || (audioConfig.requiredGroup && !lyricsConfig.enabled);

  // Check if submit should be enabled (either audio or lyrics if in a required group)
  const canSubmit = (() => {
    // If audio is simply required, need audio
    if (audioConfig.required && !audioUpload) return false;
    // If lyrics is simply required, need lyrics
    if (lyricsConfig.required && !form.watch("lyrics")?.trim()) return false;
    // If both are in a required group, need at least one
    if (audioConfig.requiredGroup && lyricsConfig.requiredGroup === audioConfig.requiredGroup) {
      return !!audioUpload || !!form.watch("lyrics")?.trim();
    }
    // Otherwise, just check individual required fields
    if (audioConfig.enabled && audioConfig.required && !audioUpload) return false;
    return true;
  })();

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

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              {validationErrors.map((error, index) => (
                <Text key={index} size="sm" className="text-red-600 dark:text-red-400">
                  {error}
                </Text>
              ))}
            </div>
          )}

          {/* Audio Upload - only show if enabled */}
          {audioConfig.enabled && (
            <div className="space-y-2">
              <FormLabel htmlFor="audio-upload">
                {audioConfig.label || "Audio File"}{" "}
                {isAudioRequired && <span className="text-red-500">*</span>}
                {audioConfig.requiredGroup && !audioConfig.required && (
                  <Text as="span" size="sm" color="muted"> (or provide lyrics)</Text>
                )}
              </FormLabel>
              <Text size="sm" color="muted">
                {song.title !== null ? "Upload your song" : "Upload your cover"}
              </Text>
              <MediaUploader
                key={`audio-${audioResetKey}`}
                bucket={BUCKETS.AUDIO_SUBMISSIONS}
                accept="audio/*"
                maxSizeMB={audioConfig.maxSizeMB ?? 50}
                variant="button"
                buttonText="Choose Audio File"
                showPreview={true}
                onFilesSelected={(files) => {
                  // Clear any previous upload state when new file is selected
                  if (files.length > 0) {
                    setAudioUpload(null);
                    setUploadError(null);
                  }
                }}
                onFilesRemoved={() => {
                  // Clear upload state and reset component when file is removed
                  setAudioUpload(null);
                  form.setValue("audioFileUrl", "");
                  form.setValue("audioFilePath", "");
                  form.setValue("audioFileSize", undefined);
                  form.setValue("audioDuration", undefined);
                  setAudioResetKey(prev => prev + 1);
                }}
                onUploadComplete={(results) => {
                  if (results.length > 0) {
                    setAudioUpload(results[0]);
                    setUploadError(null);

                    // Extract audio duration from metadata if available
                    const audioDuration = results[0].metadata?.audio
                      ? (results[0].metadata.audio as { duration?: number }).duration
                      : undefined;

                    // Update form values (shouldValidate: false to avoid showing errors before submit)
                    form.setValue("audioFileUrl", results[0].url);
                    form.setValue("audioFilePath", results[0].path);
                    if (results[0].fileSize) {
                      form.setValue("audioFileSize", results[0].fileSize);
                    }
                    if (audioDuration) {
                      form.setValue("audioDuration", audioDuration);
                    }
                  }
                }}
                onUploadError={(error) => {
                  setUploadError(error.message);
                  setAudioUpload(null);
                }}
              />
              {uploadError && (
                <Text size="sm" color="destructive">{uploadError}</Text>
              )}
            </div>
          )}

          {/* Cover Image Upload - only show if enabled */}
          {coverImageConfig.enabled && (
            <div className="space-y-2">
              <FormLabel htmlFor="cover-image-upload">
                {coverImageConfig.label || "Cover Art"}{" "}
                {coverImageConfig.required ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <Text as="span" size="sm" color="muted">(Optional)</Text>
                )}
              </FormLabel>
              <Text size="sm" color="muted">
                {coverImageConfig.description || "Upload cover art for your submission (will use your profile picture if not provided)"}
              </Text>
              <MediaUploader
                key={`cover-${coverResetKey}`}
                bucket={BUCKETS.SUBMISSION_IMAGES}
                accept="image/*"
                maxSizeMB={coverImageConfig.maxSizeMB ?? 5}
                enableCrop={coverImageConfig.enableCrop ?? true}
                variant="button"
                buttonText="Choose Cover Image"
                showPreview={true}
                onFilesSelected={(files) => {
                  // Clear any previous upload state when new file is selected
                  if (files.length > 0) {
                    setCoverImageUpload(null);
                  }
                }}
                onFilesRemoved={() => {
                  // Clear upload state and reset component when file is removed
                  setCoverImageUpload(null);
                  form.setValue("coverImageUrl", "");
                  form.setValue("coverImagePath", "");
                  setCoverResetKey(prev => prev + 1);
                }}
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
          )}

          {/* Lyrics Field - only show if enabled */}
          {lyricsConfig.enabled && (
            <div className="space-y-2">
              <FormLabel htmlFor="lyrics">
                {lyricsConfig.label || "Lyrics"}{" "}
                {lyricsConfig.required && <span className="text-red-500">*</span>}
                {lyricsConfig.requiredGroup && !lyricsConfig.required && (
                  <Text as="span" size="sm" color="muted"> (or provide audio)</Text>
                )}
              </FormLabel>
              {lyricsConfig.description && (
                <Text size="sm" color="muted">
                  {lyricsConfig.description}
                </Text>
              )}
              <Textarea
                id="lyrics"
                {...form.register("lyrics")}
                placeholder={lyricsConfig.placeholder || "Enter your song lyrics..."}
                rows={8}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          )}

          <FormBuilder
            fields={getFormFields(song.title !== null, submissionFormConfig)}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !canSubmit} size="full">
            {isLoading ? submitContent.submittingText : submitButtonText}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
