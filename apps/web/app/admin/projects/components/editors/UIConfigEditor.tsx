import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface UIConfigEditorProps {
  ui: ProjectConfig["ui"];
  onChange: (ui: ProjectConfig["ui"]) => void;
}

export function UIConfigEditor({ ui, onChange }: UIConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            label="Primary Color"
            tooltip="Main brand color applied throughout the application. Affects buttons, links, and primary UI elements."
          />
          <input
            type="color"
            value={ui.primaryColor}
            onChange={(e) => onChange({ ...ui, primaryColor: e.target.value })}
            className="w-full h-10 rounded border border-border"
          />
          <input
            type="text"
            value={ui.primaryColor}
            onChange={(e) => onChange({ ...ui, primaryColor: e.target.value })}
            className="w-full mt-1 px-3 py-1 text-sm rounded border border-border bg-background"
            placeholder="#3b82f6"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Accent Color"
            tooltip="Secondary brand color for highlights and accents. Used for emphasis and interactive elements."
          />
          <input
            type="color"
            value={ui.accentColor}
            onChange={(e) => onChange({ ...ui, accentColor: e.target.value })}
            className="w-full h-10 rounded border border-border"
          />
          <input
            type="text"
            value={ui.accentColor}
            onChange={(e) => onChange({ ...ui, accentColor: e.target.value })}
            className="w-full mt-1 px-3 py-1 text-sm rounded border border-border bg-background"
            placeholder="#8b5cf6"
          />
        </div>
      </div>
      <div>
        <LabelWithTooltip
          label="Theme"
          tooltip="Default color theme for the project. Controls base background colors and text contrast. Users may override with personal preferences."
        />
        <select
          value={ui.theme}
          onChange={(e) => onChange({ ...ui, theme: e.target.value as "light" | "dark" | "auto" })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <LabelWithTooltip
          label="Logo URL (optional)"
          tooltip="Custom logo URL for the project. Appears in navigation header and main pages. Enables white-labeling for different projects."
        />
        <input
          type="url"
          value={ui.logoUrl || ""}
          onChange={(e) => onChange({ ...ui, logoUrl: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="https://example.com/logo.png"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Favicon URL (optional)"
          tooltip="Custom favicon for browser tabs. Small icon that represents your project in browser tabs and bookmarks."
        />
        <input
          type="url"
          value={ui.favicon || ""}
          onChange={(e) => onChange({ ...ui, favicon: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="https://example.com/favicon.ico"
        />
      </div>
    </div>
  );
}
