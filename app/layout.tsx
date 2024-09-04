import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";

import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { Navigation } from "./Navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full bg-[#0a0a1e]">
        {children}
      </body>
    </html>
  );
}
