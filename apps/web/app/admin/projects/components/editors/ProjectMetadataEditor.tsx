import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface ProjectMetadataEditorProps {
  metadata: ProjectConfig["metadata"];
  onChange: (metadata: ProjectConfig["metadata"]) => void;
}

export function ProjectMetadataEditor({ metadata, onChange }: ProjectMetadataEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <LabelWithTooltip
          label="Description"
          tooltip="Full description of the project's purpose and goals. Shown on project landing pages and used in SEO meta descriptions."
        />
        <textarea
          value={metadata.description}
          onChange={(e) => onChange({ ...metadata, description: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          rows={3}
          placeholder="A music community project"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Tagline (optional)"
          tooltip="Catchy phrase or slogan for the project. Often displayed near the project name on hero sections for marketing and branding."
        />
        <input
          type="text"
          value={metadata.tagline || ""}
          onChange={(e) => onChange({ ...metadata, tagline: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="A catchy tagline"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            label="Icon"
            tooltip="Visual identifier for the project. Appears in project lists and navigation for quick visual differentiation between projects."
          />
          <select
            value={metadata.icon}
            onChange={(e) =>
              onChange({
                ...metadata,
                icon: e.target.value as "music" | "vote" | "trophy" | "users" | "sparkles",
              })
            }
            className="w-full px-3 py-2 rounded border border-border bg-background"
          >
            <option value="music">Music</option>
            <option value="vote">Vote</option>
            <option value="trophy">Trophy</option>
            <option value="users">Users</option>
            <option value="sparkles">Sparkles</option>
          </select>
        </div>
        <div>
          <LabelWithTooltip
            label="Accent Color"
            tooltip="Project-specific accent color for metadata displays. Used in project cards and preview elements."
          />
          <input
            type="color"
            value={metadata.accentColor}
            onChange={(e) => onChange({ ...metadata, accentColor: e.target.value })}
            className="w-full h-10 rounded border border-border"
          />
          <input
            type="text"
            value={metadata.accentColor}
            onChange={(e) => onChange({ ...metadata, accentColor: e.target.value })}
            className="w-full mt-1 px-3 py-1 text-sm rounded border border-border bg-background"
            placeholder="#3b82f6"
          />
        </div>
      </div>
    </div>
  );
}
