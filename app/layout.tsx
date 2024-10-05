import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";

import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { userSessionProvider } from "@/providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {userId} = await userSessionProvider()
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
            <Header userId={userId} />
              <Suspense fallback={<Loading />}>{children}</Suspense>
            <Toaster />
            <div id="footer" className="flex py-2 justify-center" />
        </div>
      </body>
    </html>
  );
}
