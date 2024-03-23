import React from "react";
import { EmailAuthModal } from "../client/EmailAuthModal";

export const SignInGate = ({
  children,
  userId,
  redirectUrl,
}: {
  children: React.ReactElement;
  userId?: string;
  redirectUrl: string;
}) => {
  return !!userId ? (
    <>{children}</>
  ) : (
    <EmailAuthModal
      redirectUrl={redirectUrl}
      isOpen={true}
      titleOverride="Get your Login link"
    />
  );
};
