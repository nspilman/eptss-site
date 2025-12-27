import { RequireAdmin } from "@eptss/admin";
import { ProjectConfigEditor } from "./ProjectConfigEditor";

import { Text } from "@eptss/ui";
export default async function ProjectsAdminPage() {
  return (
    <RequireAdmin>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Configuration</h1>
          <Text color="secondary">
            Edit project configurations including features, UI, business rules, and content.
          </Text>
        </div>
        <ProjectConfigEditor />
      </div>
    </RequireAdmin>
  );
}
