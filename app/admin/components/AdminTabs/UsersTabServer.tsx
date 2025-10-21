import { getActiveUsers } from "@/providers/adminProvider/adminProvider";
import { UsersTab } from "./UsersTab";

export async function UsersTabServer() {
  const activeUsers = await getActiveUsers();
  
  return <UsersTab activeUsers={activeUsers} />;
}
