import { redirect } from "next/navigation";
import { LoginForm } from "@eptss/auth/components";

export default async function LoginPage() {
  // You can either redirect to the web app login:
  // const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";
  // redirect(`${webAppUrl}/login`);
  
  // Or show the login form directly in the admin app:
  return (
    <div className="min-h-screen flex items-start justify-center pt-20 bg-black">
      <LoginForm redirectUrl="/admin" titleOverride="Admin Login" />
    </div>
  );
}
