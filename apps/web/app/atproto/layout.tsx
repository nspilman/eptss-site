import type { ReactNode } from "react";

/** The /atproto reading room — EPTSS-themed, a max-width column on the app ground. */
export default function AtprotoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {children}
    </div>
  );
}
