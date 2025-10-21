import { adminProvider } from "@/providers/adminProvider/adminProvider";
import { OverviewTab } from "../OverviewTab";

export async function OverviewTabServer() {
  const stats = await adminProvider();
  
  return <OverviewTab stats={stats} />;
}
