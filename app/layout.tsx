import { EmailAuthModalContextProvider } from "@/components/context/EmailAuthModal";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Header } from "../components/shared/Header";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  return (
    <html lang="en">
      <body>
        <EmailAuthModalContextProvider>
          <Header userId={userId} />
        </EmailAuthModalContextProvider>
        <div>{children}</div>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
