"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { toast } from "@eptss/ui";
import { FormReturn } from "../types";

interface UseFormSubmissionProps<T extends FieldValues> {
  onSubmit: (data: FormData) => Promise<FormReturn>;
  form: UseFormReturn<T>;
  successMessage?: string;
  onSuccess?: () => void;
}

export function useFormSubmission<T extends FieldValues>({
  onSubmit,
  form,
  successMessage = "Success!",
  onSuccess,
}: UseFormSubmissionProps<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const { formState } = form;

  // Helper function to convert field names to human-friendly labels
  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      audioFileUrl: 'Audio File',
      audioFilePath: 'Audio File',
      coverImageUrl: 'Cover Image',
      coverImagePath: 'Cover Image',
      audioDuration: 'Audio Duration',
      audioFileSize: 'Audio File Size',
      coolThingsLearned: 'Cool Things Learned',
      toolsUsed: 'Tools Used',
      happyAccidents: 'Happy Accidents',
      didntWork: "What Didn't Work",
      roundId: 'Round ID',
      email: 'Email',
      songTitle: 'Song Title',
      artist: 'Artist',
      youtubeLink: 'YouTube Link',
      soundcloudUrl: 'SoundCloud URL',
      additionalComments: 'Additional Comments',
    };
    return labels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // This effect will run when formState.errors changes
  useEffect(() => {
    // Only show errors if the form has been submitted (submitCount > 0)
    // This prevents showing errors on page load even if validation fails
    if (Object.keys(formState.errors).length > 0 && formState.submitCount > 0) {
      // Get all error messages with field names
      const errorMessages = Object.entries(formState.errors)
        .map(([fieldName, error]) => {
          const fieldLabel = getFieldLabel(fieldName);
          const message = error?.message;
          // Ensure message is a string
          const messageStr = typeof message === 'string' ? message : String(message || '');
          // If the message already contains the field info, just return it
          // Otherwise, prepend the field label
          if (messageStr && !messageStr.toLowerCase().includes(fieldLabel.toLowerCase())) {
            return `${fieldLabel}: ${messageStr}`;
          }
          return messageStr;
        })
        .filter(Boolean)
        .join('\n');

      if (errorMessages) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: errorMessages,
        });
      }
    }
  }, [formState.errors, formState.submitCount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Trigger validation manually
    const isValid = await form.trigger();

    if (!isValid) {
      // Show validation errors in a toast with field names
      const errorMessages = Object.entries(formState.errors)
        .map(([fieldName, error]) => {
          const fieldLabel = getFieldLabel(fieldName);
          const message = error?.message;
          // Ensure message is a string
          const messageStr = typeof message === 'string' ? message : String(message || '');
          // If the message already contains the field info, just return it
          // Otherwise, prepend the field label
          if (messageStr && !messageStr.toLowerCase().includes(fieldLabel.toLowerCase())) {
            return `${fieldLabel}: ${messageStr}`;
          }
          return messageStr;
        })
        .filter(Boolean)
        .join('\n');

      if (errorMessages) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: errorMessages,
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Get form values
      const values = form.getValues();

      // Create FormData object
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        // Only append non-null, non-undefined values
        // FormData.append automatically converts to string, so we just pass the value
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Submit the form
      const rawResult = await onSubmit(formData);

      // Ensure we have a serializable result
      const result: FormReturn = {
        status: rawResult.status,
        message: rawResult.message || "",
        variant: rawResult.variant
      };

      if (result.status === "Success") {
        form.reset();
        toast({
          description: successMessage,
        });
        onSuccess?.();
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
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
  };
}
