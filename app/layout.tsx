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
import { userParticipationProvider } from "@/providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {userId} = await userParticipationProvider();
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
          <EmailAuthModalContextProvider>
            <Header userId={userId} />
              <Suspense fallback={<Loading />}>{children}</Suspense>
            <Toaster />
            <div id="footer" className="flex py-2 justify-center" />
          </EmailAuthModalContextProvider>
        </div>
      </body>
    </html>
  );
}
