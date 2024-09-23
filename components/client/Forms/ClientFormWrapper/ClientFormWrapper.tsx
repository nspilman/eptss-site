"use client";

import { useToast } from "@/components/ui/use-toast";
import { SubmitButton } from "../SubmitButton";
import { FormEvent, useState } from "react";
import { FormReturn } from "@/types";

type OnSuccess = (e: FormData) => void | (() => void);

interface Props {
  children: React.ReactElement;
  action: (formData: FormData) => Promise<FormReturn>;
  disabled?: boolean;
  disableForm?: () => void;
  submitButtonLabel?: string;
  buttonPosition?: "below" | "right";
  trackSubmission?: () => void;
  SubmittedView?: () => React.ReactElement;
  onSuccess?: OnSuccess;
  secondary?: {
    label: string;
    onClick: () => void;
  };
}
export const ClientFormWrapper = ({
  children,
  action,
  disabled,
  submitButtonLabel,
  buttonPosition = "below",
  trackSubmission,
  SubmittedView,
  onSuccess,
  secondary,
}: Props) => {
  const { toast } = useToast();

  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackSubmission?.();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setPending(true);
    const { status, message } = await action(formData);
    toast({
      title: status,
      description: message,
      variant: status === "Success" ? "default" : "destructive",
    });
    if (status === "Success") {
      onSuccess?.(formData);
    }
    setPending(false);
  };

  const className =
    buttonPosition === "below"
      ? "flex-col"
      : "flex-col lg:flex-row items-end content-center ";

  return (
    <>
      {disabled ? (
        SubmittedView ? (
          <SubmittedView />
        ) : (
          <>Submitted!</>
        )
      ) : (
        <form className={`space-y-4 flex ${className}`} onSubmit={handleSubmit}>
          {/* Thank you so much for your submission. */}
          {children}
          <>
          <span className="pb-1" />
            <SubmitButton
              label={submitButtonLabel || "Submit"}
              disabled={disabled}
              pending={pending}
            />
            {secondary && (
              <button onClick={secondary.onClick}>{secondary.label}</button>
            )}
          </>
        </form>
      )}
    </>
  );
};
