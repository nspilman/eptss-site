import AuthStateListener from "@/components/AuthStateListener";

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
