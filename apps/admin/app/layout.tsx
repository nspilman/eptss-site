import { Toaster } from "@eptss/ui";
import "../styles/globals.css";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { isAdmin } from "@eptss/data-access/utils/isAdmin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard | Everyone Plays the Same Song",
  description: "Administrative dashboard for managing Everyone Plays the Same Song",
  icons: {
    icon: "/eptss-logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getAuthUser();
  
  // Redirect non-authenticated users to login
  if (!userId) {
    redirect("/login");
  }

  // Check if user is admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/");
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[var(--color-background-primary)] text-[var(--color-primary)]">
          <header className="border-b border-background-tertiary/50 bg-background-secondary/30">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">EPTSS Admin</h1>
            </div>
          </header>
          <main className="container mx-auto">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
