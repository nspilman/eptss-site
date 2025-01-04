"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form } from "@/components/Form";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { FormReturn } from "@/types";
import { userSessionProvider } from "@/providers";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get('redirectUrl');
  const titleOverride = searchParams.get('titleOverride');

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
        redirectUrl: redirectUrl || undefined,
      });
      
      if (error) {
        return {
          status: "Error" as const,
          message: error?.message || "Something went wrong",
        };
      }
      
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
    <div className="min-h-screen flex items-start justify-center pt-20 bg-black">
      <div className="w-full max-w-[500px] px-8 py-6 rounded-lg">
        <ClientFormWrapper action={onSendLoginLink}>
          <Form
            title={titleOverride || "Login in with your email"}
            description=""
            formSections={[
              {
                label: "Email",
                placeholder: "We will email you your login link",
                id: "email",
                defaultValue: "",
              },
            ]}
            submitButtonText="Send Login Link"
          />
        </ClientFormWrapper>
        <div className="w-full flex justify-center">
          <Button
            className="w-32 mt-4"
            onClick={() => router.push("/")}
            variant="secondary"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 