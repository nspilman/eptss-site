import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./Header";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";

import { Suspense } from "react";
import { Loading } from "@/components/Loading";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="p-0 w-100">
          <EmailAuthModalContextProvider>
            <Header />
            <div className="flex flex-wrap py-24 px-8 justify-center min-h-[100vh]">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </div>
            <Toaster />
            <div id="footer" className="flex py-2 justify-center" />
          </EmailAuthModalContextProvider>
        </div>
      </body>
    </html>
  );
}
