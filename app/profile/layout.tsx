import DashboardLayout from "../layouts/DashboardLayout";

export default function ProfilePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
