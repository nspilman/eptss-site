import { getActiveUsers } from "@eptss/data-access";
import { UsersTab } from "./UsersTab";

export async function UsersTabServer() {
  const activeUsers = await getActiveUsers();
  
  return <UsersTab activeUsers={activeUsers} />;
}
