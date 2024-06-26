import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./Header";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Suspense } from "react";
import { Loading } from "@/components/Loading";

import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme-providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Everyone Plays the Same Song",
  description: "Community Covers Project",
};



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem  
        disableTransitionOnChange 
        >

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
        </ThemeProvider>
      </body>
    </html>
  );
}
