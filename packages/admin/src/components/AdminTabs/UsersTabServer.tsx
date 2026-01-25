import { getActiveUsers } from "@eptss/core";
import { UsersTab } from "./UsersTab";

export async function UsersTabServer() {
  const activeUsers = await getActiveUsers();
  
  return <UsersTab activeUsers={activeUsers} />;
}
