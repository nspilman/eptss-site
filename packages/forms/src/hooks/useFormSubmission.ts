"use client";

import { useState } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { toast } from "@eptss/ui";
import { FormReturn } from "../types";
import { getFieldLabel } from "@eptss/data-access";

interface UseFormSubmissionProps<T extends FieldValues> {
  onSubmit: (data: FormData) => Promise<FormReturn>;
  form: UseFormReturn<T>;
  successMessage?: string;
  onSuccess?: () => void;
}

/**
 * Formats form errors into a human-readable string
 */
function formatFormErrors(errors: Record<string, unknown>): string {
  return Object.entries(errors)
    .map(([fieldName, error]) => {
      const fieldLabel = getFieldLabel(fieldName);
      const message = (error as { message?: unknown })?.message;
      const messageStr = typeof message === 'string' ? message : String(message || '');
      if (messageStr && !messageStr.toLowerCase().includes(fieldLabel.toLowerCase())) {
        return `${fieldLabel}: ${messageStr}`;
      }
      return messageStr;
    })
    .filter(Boolean)
    .join('\n');
}

export function useFormSubmission<T extends FieldValues>({
  onSubmit,
  form,
  successMessage = "Success!",
  onSuccess,
}: UseFormSubmissionProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = await form.trigger();

    if (!isValid) {
      const errorMessages = formatFormErrors(form.formState.errors);
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
