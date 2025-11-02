import { AuthStateListener } from "@eptss/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStateListener>
      <main className="min-h-screen">
        {children}
      </main>
    </AuthStateListener>
  );
}
