import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";

import { getAuthUser } from "@/utils/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = getAuthUser();
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </head>
      <body>
        <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">

          <Header userId={userId} />
          {children}
          <Toaster />
          <div id="footer" className="flex py-2 justify-center" />
        </div>
      </body>
    </html>
  );
}
