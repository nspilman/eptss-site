"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/client/LoginForm/LoginForm";
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
              <LoginForm 
                redirectUrl={redirectUrl}
                titleOverride={titleOverride || "Hey there!"}
                onSuccess={onClose}
              />
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
