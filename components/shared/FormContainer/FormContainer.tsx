"use client";
import { useSuccessState } from "components/hooks/useSuccessState";
import { useToast } from "components/ui/use-toast";
import { useEffect } from "react";
import { FieldValues } from "react-hook-form";
import { Form } from "./Form";
import { InputType } from "./Form/types";

interface Props<T extends FieldValues> {
  successBlock: React.ReactNode;
  errorMessage: string;
  title: string;
  description?: React.ReactNode;
  fields: InputType<T>[];
  onSubmit: (payload: T) => Promise<"success" | "error">;
  submitButtonText?: string;
}

export function FormContainer<T extends FieldValues>({
  title,
  description,
  onSubmit,
  fields,
  successBlock,
  errorMessage,
  submitButtonText,
}: Props<T>) {
  const [successState, setSuccessState] = useSuccessState();
  const { toast } = useToast();
  useEffect(() => {
    if (successState === "error") {
      toast({
        title: "Whoops, something broke",
        description:
          "An error has occurred. Please try again and/or hit Nate up.",
        variant: "destructive",
      });
    }
  });
  return (
    <div className="flex items-center justify-center bg-[rgba(28,32,38,.9)] py-8 px-12 rounded-3xl w-full">
      <div className="w-[300px] sm:w-[450px] md:w-[600px] lg:w-[800px] flex items-center">
        {successState !== "success" ? (
          <Form
            title={title}
            description={description}
            formSections={fields}
            onSubmit={async (payload: T) =>
              setSuccessState(await onSubmit(payload))
            }
            submitButtonText={submitButtonText}
          />
        ) : (
          successBlock
        )}
        {successState === "error" && errorMessage}
      </div>
    </div>
  );
}
