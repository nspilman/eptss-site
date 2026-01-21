"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, FormLabel, Text, Textarea, toast } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui";
import { submissionFormSchema, type SubmissionInput } from "@eptss/data-access/schemas/submission"
import type { ExistingSubmission } from "@eptss/data-access"
import { PageContent, SubmissionFormConfig } from "@eptss/project-config";
import {
  MediaUploader,
  uploadReducer,
  initialUploadState,
  canSubmit,
  deriveSubmitConfig,
  buildPayload,
  payloadToFormData,
  type UploadState,
} from "@eptss/media-upload";
import { BUCKETS } from "@eptss/bucket-storage";
import { routes } from "@eptss/routing";

interface Props {
  projectSlug: string;
  roundId: number;
  hasSubmitted: boolean;
  existingSubmission: ExistingSubmission | null;
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
  projectSlug,
  roundId,
  hasSubmitted,
  existingSubmission,
  song,
  dateStrings,
  submitCover,
  submitContent,
  submissionFormConfig,
}: Props) => {
  const router = useRouter();
  const { coverClosesLabel, listeningPartyLabel } = dateStrings;

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get field configs for easier access
  const audioConfig = submissionFormConfig.fields.audioFile;
  const coverImageConfig = submissionFormConfig.fields.coverImage;
  const lyricsConfig = submissionFormConfig.fields.lyrics;

  // Derive submit config from form config (what's required)
  const submitConfig = deriveSubmitConfig(submissionFormConfig);

  // Compute initial upload states from existing submission
  const initialAudioState: UploadState = existingSubmission?.audioFileUrl
    ? {
        file: null,
        status: 'complete',
        progress: 100,
        result: {
          url: existingSubmission.audioFileUrl,
          path: existingSubmission.audioFilePath || '',
          fileSize: existingSubmission.audioFileSize ?? undefined,
          metadata: existingSubmission.audioDuration
            ? { audio: { duration: existingSubmission.audioDuration } }
            : undefined,
        },
        error: null,
      }
    : initialUploadState;

  const initialImageState: UploadState = existingSubmission?.coverImageUrl
    ? {
        file: null,
        status: 'complete',
        progress: 100,
        result: {
          url: existingSubmission.coverImageUrl,
          path: existingSubmission.coverImagePath || '',
        },
        error: null,
      }
    : initialUploadState;

  // Upload state - using reducers for explicit state tracking
  // MediaUploader handles the actual upload, we just track state via callbacks
  const [audioState, dispatchAudio] = useReducer(uploadReducer, initialAudioState);
  const [imageState, dispatchImage] = useReducer(uploadReducer, initialImageState);

  // Form for text fields only (what react-hook-form is good at)
  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      audioFileUrl: existingSubmission?.audioFileUrl || "",
      audioFilePath: existingSubmission?.audioFilePath || "",
      coverImageUrl: existingSubmission?.coverImageUrl || "",
      coverImagePath: existingSubmission?.coverImagePath || "",
      audioDuration: existingSubmission?.audioDuration ?? undefined,
      audioFileSize: existingSubmission?.audioFileSize ?? undefined,
      lyrics: existingSubmission?.lyrics || "",
      coolThingsLearned: existingSubmission?.coolThingsLearned || "",
      toolsUsed: existingSubmission?.toolsUsed || "",
      happyAccidents: existingSubmission?.happyAccidents || "",
      didntWork: existingSubmission?.didntWork || "",
      roundId
    },
  })

  // Watch lyrics for the audio-or-lyrics validation
  const lyrics = form.watch("lyrics");
  const hasLyrics = Boolean(lyrics?.trim());

  // Check if form can be submitted using pure function
  const submitCheck = canSubmit(
    { audio: audioState, image: imageState },
    submitConfig,
    hasLyrics
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check upload status first
    if (!submitCheck.allowed) {
      setValidationErrors(submitCheck.errors);
      return;
    }
    setValidationErrors([]);

    // Validate text fields with react-hook-form
    const isValid = await form.trigger();
    if (!isValid) {
      const errorMessages = Object.values(form.formState.errors)
        .map(error => error?.message)
        .filter(Boolean);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessages.join(", ") || "Please check your form inputs.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload from upload states + text fields
      const textFields = form.getValues();
      const payload = buildPayload(
        roundId,
        { audio: audioState, image: imageState },
        {
          lyrics: textFields.lyrics,
          coolThingsLearned: textFields.coolThingsLearned,
          toolsUsed: textFields.toolsUsed,
          happyAccidents: textFields.happyAccidents,
          didntWork: textFields.didntWork,
        }
      );

      // Convert to FormData for server action
      const formData = payloadToFormData(payload);

      // Submit
      const result = await submitCover(formData);

      if (result.status === "Success") {
        // Redirect to success page
        router.push(routes.projects.submit.success(projectSlug as "cover" | "monthly-original"));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Determine if audio is required based on config
  const isAudioRequired = audioConfig.required || (audioConfig.requiredGroup && !lyricsConfig.enabled);

  // Get upload status text
  const getUploadStatusText = (state: UploadState) => {
    if (state.status === 'uploading') return "Uploading...";
    if (state.status === 'complete') return "Upload complete";
    if (state.status === 'error') return "Upload failed";
    return null;
  };

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
                {existingSubmission?.audioFileUrl
                  ? "Replace your existing audio file or keep the current one"
                  : song.title !== null ? "Upload your song" : "Upload your cover"}
              </Text>
              {existingSubmission?.audioFileUrl && audioState.status === 'complete' && audioState.result?.url === existingSubmission.audioFileUrl && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <Text size="sm" className="text-green-700 dark:text-green-400">
                    ✓ Current audio file uploaded
                  </Text>
                </div>
              )}
              <MediaUploader
                bucket={BUCKETS.AUDIO_SUBMISSIONS}
                accept="audio/*"
                maxSizeMB={audioConfig.maxSizeMB ?? 50}
                variant="button"
                buttonText="Choose Audio File"
                showPreview={true}
                onFilesSelected={(files) => {
                  if (files.length > 0) {
                    // Track that upload is starting
                    dispatchAudio({ type: 'SELECT_FILE', file: files[0] });
                    dispatchAudio({ type: 'UPLOAD_START' });
                  }
                }}
                onFilesRemoved={() => {
                  dispatchAudio({ type: 'CLEAR' });
                }}
                onUploadComplete={(results) => {
                  if (results.length > 0) {
                    const result = results[0];
                    // Extract audio duration from metadata if available
                    const audioDuration = result.metadata?.audio
                      ? (result.metadata.audio as { duration?: number }).duration
                      : undefined;
                    dispatchAudio({
                      type: 'UPLOAD_SUCCESS',
                      result: {
                        url: result.url,
                        path: result.path,
                        fileSize: result.fileSize,
                        metadata: audioDuration ? { audio: { duration: audioDuration } } : undefined,
                      },
                    });
                  }
                }}
                onUploadError={(error) => {
                  dispatchAudio({ type: 'UPLOAD_ERROR', error: error.message });
                  toast({
                    variant: "destructive",
                    title: "Audio Upload Error",
                    description: error.message,
                  });
                }}
              />
              {/* Upload status feedback */}
              {audioState.status !== 'idle' && (
                <Text
                  size="sm"
                  color={audioState.status === 'complete' ? undefined : audioState.status === 'error' ? "destructive" : "muted"}
                >
                  {getUploadStatusText(audioState)}
                </Text>
              )}
              {audioState.status === 'error' && audioState.error && (
                <Text size="sm" color="destructive">{audioState.error}</Text>
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
                {existingSubmission?.coverImageUrl
                  ? "Replace your existing cover image or keep the current one"
                  : coverImageConfig.description || "Upload cover art for your submission (will use your profile picture if not provided)"}
              </Text>
              {existingSubmission?.coverImageUrl && imageState.status === 'complete' && imageState.result?.url === existingSubmission.coverImageUrl && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <Text size="sm" className="text-green-700 dark:text-green-400">
                    ✓ Current cover image uploaded
                  </Text>
                </div>
              )}
              <MediaUploader
                bucket={BUCKETS.SUBMISSION_IMAGES}
                accept="image/*"
                maxSizeMB={coverImageConfig.maxSizeMB ?? 5}
                enableCrop={false} // TODO: implement upload-then-crop flow
                variant="button"
                buttonText="Choose Cover Image"
                showPreview={true}
                onFilesSelected={(files) => {
                  if (files.length > 0) {
                    dispatchImage({ type: 'SELECT_FILE', file: files[0] });
                    dispatchImage({ type: 'UPLOAD_START' });
                  }
                }}
                onFilesRemoved={() => {
                  dispatchImage({ type: 'CLEAR' });
                }}
                onUploadComplete={(results) => {
                  if (results.length > 0) {
                    const result = results[0];
                    dispatchImage({
                      type: 'UPLOAD_SUCCESS',
                      result: {
                        url: result.url,
                        path: result.path,
                      },
                    });
                  }
                }}
                onUploadError={(error) => {
                  dispatchImage({ type: 'UPLOAD_ERROR', error: error.message });
                  toast({
                    variant: "destructive",
                    title: "Image Upload Error",
                    description: error.message,
                  });
                }}
              />
              {/* Upload status feedback */}
              {imageState.status !== 'idle' && (
                <Text
                  size="sm"
                  color={imageState.status === 'complete' ? undefined : imageState.status === 'error' ? "destructive" : "muted"}
                >
                  {getUploadStatusText(imageState)}
                </Text>
              )}
              {imageState.status === 'error' && imageState.error && (
                <Text size="sm" color="destructive">{imageState.error}</Text>
              )}
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
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          )}

          <FormBuilder
            fields={getFormFields(song.title !== null, submissionFormConfig)}
            control={form.control}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            disabled={isSubmitting || submitCheck.pending.length > 0}
            size="full"
          >
            {isSubmitting
              ? existingSubmission ? "Updating..." : submitContent.submittingText
              : submitCheck.pending.length > 0
                ? "Waiting for uploads..."
                : existingSubmission ? "Update Submission" : submitContent.submitButtonText}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
