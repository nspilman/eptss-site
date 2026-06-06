import type { ReactNode } from "react";

/**
 * The /atproto reading room. Opts into the @eptss/atproto design tokens by
 * wrapping its content in the paper/ink ground, leaving the rest of the EPTSS
 * app's theme untouched.
 */
export default function AtprotoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <div className="mx-auto max-w-3xl px-4 py-12">{children}</div>
    </div>
  );
}
