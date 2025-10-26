import { adminProvider } from "@eptss/data-access";
import { OverviewTab } from "../OverviewTab";

export async function OverviewTabServer() {
  const stats = await adminProvider();
  
  return <OverviewTab stats={stats} />;
}
