"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, FormLabel, Input, Text, Textarea, toast } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui";
import { submissionFormSchema, type SubmissionInput } from "@eptss/core/schemas/submission"
import type { ExistingSubmission } from "@eptss/core"
import { PageContent, SubmissionFormConfig } from "@eptss/project-config";
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

/**
 * The submission form. Going forward every submission is a plyr track: the user uploads
 * their song to plyr.fm directly and pastes the track link here. The server
 * (submitPlyrCover) resolves it to the fm.plyr.track in their own repo and writes the
 * at.atjam.submission with that record as the deliverable — there is no upload here.
 * (Past audio is re-hosted separately by migrate-to-plyr; that path doesn't touch this
 * form.)
 */
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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lyricsConfig = submissionFormConfig.fields.lyrics;

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      // The track link + caption are re-entered each time (we store the resolved
      // record, not the pasted URL); the reflections come back from Postgres.
      plyrTrackUrl: "",
      note: "",
      lyrics: existingSubmission?.lyrics || "",
      coolThingsLearned: existingSubmission?.coolThingsLearned || "",
      toolsUsed: existingSubmission?.toolsUsed || "",
      happyAccidents: existingSubmission?.happyAccidents || "",
      didntWork: existingSubmission?.didntWork || "",
      roundId,
    },
  })

  const hasPlyrUrl = Boolean(form.watch("plyrTrackUrl")?.trim());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasPlyrUrl) {
      setValidationErrors(["Paste your plyr track link."]);
      return;
    }
    setValidationErrors([]);

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
      const v = form.getValues();
      const formData = new FormData();
      formData.set("roundId", String(roundId));
      formData.set("plyrTrackUrl", (v.plyrTrackUrl ?? "").trim());
      if (v.note?.trim()) formData.set("note", v.note.trim());
      if (v.lyrics?.trim()) formData.set("lyrics", v.lyrics);
      for (const k of ["coolThingsLearned", "toolsUsed", "happyAccidents", "didntWork"] as const) {
        const val = v[k];
        if (val?.trim()) formData.set(k, val);
      }

      const result = await submitCover(formData);
      if (result.status === "Success") {
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

          {/* plyr track link — the deliverable */}
          <div className="space-y-2">
            <FormLabel htmlFor="plyrTrackUrl">
              plyr track link <span className="text-red-500">*</span>
            </FormLabel>
            <Text size="sm" color="muted">
              Upload your song to plyr.fm, then paste the track link here (e.g.
              https://plyr.fm/track/123). We&apos;ll attach your plyr track — audio and
              cover and all — to this round.
            </Text>
            <Input
              id="plyrTrackUrl"
              type="url"
              inputMode="url"
              placeholder="https://plyr.fm/track/…"
              disabled={isSubmitting}
              {...form.register("plyrTrackUrl")}
            />

            <FormLabel htmlFor="note" className="pt-2">
              Caption{" "}
              <Text as="span" size="sm" color="muted">(optional, shown publicly)</Text>
            </FormLabel>
            <Textarea
              id="note"
              {...form.register("note")}
              placeholder="A short note about your cover (a sentence or two)…"
              rows={2}
              maxLength={1500}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Lyrics Field - only show if enabled */}
          {lyricsConfig.enabled && (
            <div className="space-y-2">
              <FormLabel htmlFor="lyrics">
                {lyricsConfig.label || "Lyrics"}{" "}
                {lyricsConfig.required && <span className="text-red-500">*</span>}
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

          <Button type="submit" disabled={isSubmitting} size="full">
            {isSubmitting
              ? existingSubmission ? "Updating..." : submitContent.submittingText
              : existingSubmission ? "Update Submission" : submitContent.submitButtonText}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
