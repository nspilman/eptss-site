import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./Header";

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};

import "../styles/globals.css";
import { userSessionService } from "@/data-access/userSessionService";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await userSessionService.getUserSession();
  const userId = user?.id;

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
