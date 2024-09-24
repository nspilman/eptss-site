"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Form } from "../../Form";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { FormReturn } from "@/types";
import { userSessionProvider } from "@/providers";
import { Button } from "@/components/ui/button";

export const EmailAuthModal = ({
  isOpen,
  onClose,
  redirectUrl,
  titleOverride,
}: {
  isOpen: boolean;
  onClose?: () => void;
  redirectUrl?: string;
  titleOverride?: string;
}) => {
  const router = useRouter();

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
      } else {
        onClose?.();
        return {
          status: "Success" as const,
          message: "Check your email for your login link!",
        };
      }
    } catch (error) {
      return {
        status: "Error" as const,
        message: "Something went wrong",
      };
    }
  };

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
    className={`fixed inset-0 bg-gray-600 bg-opacity-20 overflow-y-auto h-full w-full z-50 ${
      isOpen ? "flex" : "hidden"
    } justify-center pt-10 sm:pt-20`}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal bg-black px-8 py-2 rounded-lg w-[500px] h-[275px]`}
        data-testid="email-auth-modal"
      >
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-4">
              <ClientFormWrapper action={onSendLoginLink}>
                <Form
                  title={titleOverride || "Hey there!"}
                  description={
                   "" 
                  }
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
   {!onClose && (
    <div className="w-full flex justify-center">
                <Button
                  className="w-32 mt-4"
                  onClick={() => router.push("/")}
                >
                  Go Back
                </Button>
              </div>
              )}
            </div>
            <div className="flex flex-row items-center pt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
