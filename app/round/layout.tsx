import ConditionalDashboardLayout from "../layouts/ConditionalDashboardLayout";

export default function RoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConditionalDashboardLayout>{children}</ConditionalDashboardLayout>;
}
