import { isAdmin, AdminNav } from "@eptss/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Music } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Top Header with Navigation */}
      <header className="sticky top-0 z-40 border-b border-background-tertiary/50 bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <Music className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Admin</h1>
            </div>
            
            {/* Horizontal Navigation */}
            <div className="flex-1 flex justify-center">
              <AdminNav />
            </div>
            
            <Link
              href="/"
              className="text-sm text-secondary hover:text-primary transition-colors shrink-0"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
