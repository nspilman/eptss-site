"use client";
import React from "react";
import { Form } from "@/components/Form";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { FormReturn } from "@/types";
import { userSessionProvider } from "@/providers";

interface LoginFormProps {
  redirectUrl?: string;
  titleOverride?: string;
  onSuccess?: () => void;
}

export const LoginForm = ({ redirectUrl, titleOverride, onSuccess }: LoginFormProps) => {
  const onSendLoginLink = async (formData: FormData): Promise<FormReturn> => {
    try {
      const email = formData.get("email")?.toString();
      if (!email) {
        return {
          status: "Error",
          message: "Email required",
        };
      }

      const { signInWithOTP } = await userSessionProvider();

      const { error } = await signInWithOTP({
        email: email?.trim() || "",
        redirectUrl,
      });
      
      if (error) {
        return {
          status: "Error" as const,
          message: error?.message || "Something went wrong",
        };
      }
      
      onSuccess?.();
      return {
        status: "Success" as const,
        message: "Check your email for your login link!",
      };
    } catch (error) {
      return {
        status: "Error" as const,
        message: "Something went wrong",
      };
    }
  };

  return (
    <ClientFormWrapper action={onSendLoginLink}>
      <Form
        title={titleOverride || "Login with your email"}
        description=""
        formSections={[
          {
            label: "Email",
            placeholder: "We will email you your login link",
            id: "email",
            defaultValue: "",
            type: "email"
          },
        ]}
        submitButtonText="Send Login Link"
      />
    </ClientFormWrapper>
  );
}; 