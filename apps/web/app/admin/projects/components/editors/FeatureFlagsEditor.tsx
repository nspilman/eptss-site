import type { ProjectConfig } from "@eptss/project-config";
import { Tooltip } from "@eptss/ui";
import { HelpCircle } from "lucide-react";

interface FeatureFlagsEditorProps {
  features: ProjectConfig["features"];
  onChange: (features: ProjectConfig["features"]) => void;
}

export function FeatureFlagsEditor({ features, onChange }: FeatureFlagsEditorProps) {
  const flags = [
    {
      key: "enableVoting",
      label: "Enable Voting",
      tooltip: "Controls whether voting functionality is enabled. When disabled, projects operate without community voting (e.g., Monthly Original Songs).",
      affectsSettings: ["Max Votes Per User", "Min/Max Voting Duration"]
    },
    {
      key: "enableSubmissions",
      label: "Enable Submissions",
      tooltip: "Controls whether users can submit entries to rounds. Critical for project operation - most projects require this enabled.",
      affectsSettings: ["Max Submissions Per Round"]
    },
    {
      key: "enableReflections",
      label: "Enable Reflections",
      tooltip: "Allows users to write and view reflections on their submissions. Used for encouraging deeper engagement with the creative process.",
      affectsSettings: []
    },
    {
      key: "enableDiscussions",
      label: "Enable Discussions",
      tooltip: "Enables discussion forums/threads. When enabled, discussions appear in the dashboard sidebar and foster community interaction.",
      affectsSettings: []
    },
    {
      key: "enableInvites",
      label: "Enable Invites",
      tooltip: "Controls whether users can generate and send invite links with referral codes. Affects project growth and signup mechanisms.",
      affectsSettings: []
    },
    {
      key: "enableSocialSharing",
      label: "Enable Social Sharing",
      tooltip: "Shows social sharing buttons for users to share on social media platforms. Affects project visibility and viral growth potential.",
      affectsSettings: []
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4">
      {flags.map(({ key, label, tooltip, affectsSettings }) => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={features[key] ?? true}
                onChange={(e) => onChange({ ...features, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
            <Tooltip content={<div className="max-w-xs">{tooltip}</div>} side="right">
              <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
            </Tooltip>
          </div>
          {affectsSettings.length > 0 && (
            <div className="ml-6 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-secondary">Affects:</span>
              {affectsSettings.map((setting) => (
                <span key={setting} className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded">
                  {setting}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
