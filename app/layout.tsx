import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import AuthStateListener from "@/components/AuthStateListener";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "A community music project where participants cover the same song in their own unique style",
  keywords: ["music", "covers", "community", "collaboration", "songs"],
  openGraph: {
    title: "Everyone Plays the Same Song",
    description: "A community music project where participants cover the same song in their own unique style",
    url: "https://everyoneplaysthesamesong.com",
    siteName: "Everyone Plays the Same Song",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: "Everyone Plays the Same Song",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everyone Plays the Same Song",
    description: "A community music project where participants cover the same song in their own unique style",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
  },
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
        <AuthStateListener>
          <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
            <Header userId={userId} />
            {children}
            <Toaster />
            <div id="footer" className="flex py-2 justify-center" />
          </div>
        </AuthStateListener>
      </body>
    </html>
  );
}
