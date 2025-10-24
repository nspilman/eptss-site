import { redirect } from "next/navigation";

export default function AdminRootPage() {
  // Redirect to the admin dashboard
  redirect("/admin");
}
