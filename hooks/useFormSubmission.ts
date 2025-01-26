"use client";

import { useState } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { FormReturn } from "@/types";

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

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const result = await onSubmit(formData);

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
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return {
    isLoading,
    handleSubmit,
  };
}
