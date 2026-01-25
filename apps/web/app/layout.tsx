import { Toaster } from "@eptss/ui";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { AuthStateListener } from "@eptss/auth";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import { getUserProfileForHeader } from "@eptss/auth/server";

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
    icon: "/eptss-logo.png",
  },
};

import "@eptss/ui/styles";

import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { isAdmin } from "@eptss/auth";
import { getUserProjects } from "@eptss/core";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getAuthUser();
  const userIsAdmin = userId ? await isAdmin() : false;
  const userProfile = userId ? await getUserProfileForHeader() : null;
  const userProjects = userId ? await getUserProjects(userId) : [];
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
          {userId ? (
            // Authenticated users get the dashboard layout with sidebar
            <DashboardLayout isAdmin={userIsAdmin} userProfile={userProfile} userProjects={userProjects}>
              {children}
              <Toaster />
            </DashboardLayout>
          ) : (
            // Non-authenticated users get the regular layout with header and footer
            <div className="min-h-screen bg-[var(--color-background-primary)] text-[var(--color-primary)] relative overflow-hidden font-sans flex flex-col">
              {/* <BackgroundPattern /> */}
              <Header userId={userId} />
              <main className="pt-24 w-screen flex-1 pt-24 px-4 md:px-8 lg:px-12 w-screen">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          )}
        </AuthStateListener>
      </body>
    </html>
  );
}
