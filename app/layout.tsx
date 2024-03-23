import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Header } from "./Header";

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
        <div className="p-0 w-100">
          <EmailAuthModalContextProvider>
            <Header userId={userId} />
          </EmailAuthModalContextProvider>
          <div className="flex flex-wrap py-24 px-8 justify-center min-h-[100vh]">
            {children}
          </div>
          <Toaster />
          <div id="footer" className="flex py-2 justify-center" />
        </div>
      </body>
    </html>
  );
}
