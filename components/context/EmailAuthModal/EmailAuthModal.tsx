"use client";
import { useDisclosure } from "components/hooks/useDisclosure";
import { EmailAuthModal } from "components/shared/EmailAuthModal";
import React, { createContext, useContext } from "react";

// Create a Context object
const EmailAuthModalContext = createContext<
  { isOpen: boolean; setIsOpen: () => void } | undefined
>(undefined);

// Define a custom hook for easy access to the UserSessionContext
export const useAuthModal = () => {
  const context = useContext(EmailAuthModalContext);
  if (context === undefined) {
    throw new Error(
      "EmailAuthModal must be used within a EmailAuthModalContext"
    );
  }
  return context;
};

// Define the context provider component
export const EmailAuthModalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <EmailAuthModalContext.Provider value={{ isOpen, setIsOpen: onOpen }}>
      {children}
      <EmailAuthModal isOpen={isOpen} onClose={() => onClose()} />
    </EmailAuthModalContext.Provider>
  );
};
