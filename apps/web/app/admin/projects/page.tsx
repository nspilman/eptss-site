import { RequireAdmin } from "@eptss/admin";
import { ProjectConfigEditor } from "./ProjectConfigEditor";

export default async function ProjectsAdminPage() {
  return (
    <RequireAdmin>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Configuration</h1>
          <p className="text-secondary">
            Edit project configurations including features, UI, business rules, and content.
          </p>
        </div>
        <ProjectConfigEditor />
      </div>
    </RequireAdmin>
  );
}
