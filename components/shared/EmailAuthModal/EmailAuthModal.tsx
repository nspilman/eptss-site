"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "components/ui/use-toast";
import { Form } from "../FormContainer/Form";
import { createClient } from "@/utils/supabase/client";

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
  const { toast } = useToast();

  const onSendLoginLink = async ({ email }: { email: string }) => {
    try {
      const supabaseClient = createClient();
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        toast({
          title: "Error",
          description: error?.message || "Something went wrong",
          variant: "destructive",
        });
      } else {
        toast({
          variant: "success",
          title: "Check your email to log in!",
          description: "We sent you a login link. Check your email!",
          duration: 8000,
        });
        onClose?.();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
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
              <Form
                title={titleOverride || "Hey there!"}
                description={
                  "Enter your email for a login link sent to your email inbox"
                }
                formSections={[
                  {
                    label: "Email",
                    placeholder: "michael-buble@itsbublee.com",
                    id: "email",
                    defaultValue: "",
                  },
                ]}
                onSubmit={async (payload) => await onSendLoginLink(payload)}
                submitButtonText="Email me my login link"
              />
            </div>
            <div className="flex flex-row items-center pt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
