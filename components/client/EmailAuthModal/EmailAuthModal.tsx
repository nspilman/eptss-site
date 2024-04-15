"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Form } from "../../Form";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { FormReturn } from "@/types";
import { userSessionProvider } from "@/providers";

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
      console.log("hit signInWithOTP")
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
      className={`inset-0 bg-gray-600 bg-opacity-50 flex overflow-y-auto h-screen w-full z-10 sticky items-center justify-center ${
        isOpen ? "block" : "hidden"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal bg-black px-8 py-2 rounded-lg w-[500px]`}
        data-testid="email-auth-modal"
      >
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-4">
              {!onClose && (
                <button
                  className="border-2 font-bold text-sm border-white shadow-md p-1 shadow-themeYellow hover:border-themeYellow rounded text-white"
                  onClick={() => router.push("/")}
                >
                  Back
                </button>
              )}
              <ClientFormWrapper action={onSendLoginLink}>
                <Form
                  title={titleOverride || "Hey there!"}
                  description={
                    "Enter your email below and we will send you a login link."
                  }
                  formSections={[
                    {
                      label: "Email",
                      placeholder: "Enter your email",
                      id: "email",
                      defaultValue: "",
                    },
                  ]}
                  submitButtonText="Send Login Link"
                />
              </ClientFormWrapper>
            </div>
            <div className="flex flex-row items-center pt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
