"use client";

import { createContext, useContext, type ReactNode } from "react";

interface CommentContextValue {
  userContentId?: string;
  roundId?: number;
  contentAuthorId?: string;
}

const CommentContext = createContext<CommentContextValue | undefined>(undefined);

export function CommentProvider({
  children,
  userContentId,
  roundId,
  contentAuthorId,
}: {
  children: ReactNode;
  userContentId?: string;
  roundId?: number;
  contentAuthorId?: string;
}) {
  return (
    <CommentContext.Provider value={{ userContentId, roundId, contentAuthorId }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
}
