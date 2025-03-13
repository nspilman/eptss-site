"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/client/LoginForm/LoginForm";
import {
  Dialog,
  DialogContent,
  Button
} from "@/components/ui/primitives";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>      
      <DialogContent 
        className="w-[500px] max-h-[90vh] overflow-y-auto"
        data-testid="email-auth-modal"
      >
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
      </DialogContent>
    </Dialog>
  );
};
