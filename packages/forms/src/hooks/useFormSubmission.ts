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

  // This effect will run when formState.errors changes
  useEffect(() => {
    // If there are errors and the form has been submitted or fields touched
    if (Object.keys(formState.errors).length > 0 &&
        (formState.isSubmitted || Object.keys(formState.touchedFields).length > 0)) {
      // Get all error messages
      const errorMessages = Object.entries(formState.errors)
        .map(([field, error]) => `${field}: ${error?.message}`)
        .join('\n');

      if (errorMessages) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: errorMessages,
        });
      }
    }
  }, [formState.errors, formState.isSubmitted, formState.touchedFields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Trigger validation manually
    const isValid = await form.trigger();

    if (!isValid) {
      // Don't proceed if validation fails - errors will be shown by the useEffect above
      return;
    }

    setIsLoading(true);

    try {
      // Get form values
      const values = form.getValues();

      // Create FormData object
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string);
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
