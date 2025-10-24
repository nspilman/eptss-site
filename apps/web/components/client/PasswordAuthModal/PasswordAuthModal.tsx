"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PasswordAuthForm } from "@/components/client/PasswordAuthForm/PasswordAuthForm";
import {
  Dialog,
  DialogContent,
  Button
} from "@eptss/ui";

export const PasswordAuthModal = ({
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>      
      <DialogContent 
        className="w-[500px] max-h-[90vh] overflow-y-auto"
        data-testid="password-auth-modal"
      >
        <PasswordAuthForm 
          redirectUrl={redirectUrl}
          titleOverride={titleOverride || "Authentication"}
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
      </DialogContent>
    </Dialog>
  );
};
