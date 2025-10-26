import { Toaster } from "@eptss/ui";
import "@eptss/ui/styles";

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
  // Auth checks are handled by middleware now
  // Layout should not redirect to avoid conflicts
  
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
