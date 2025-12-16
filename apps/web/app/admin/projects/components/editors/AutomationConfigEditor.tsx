import type { ProjectConfig } from "@eptss/project-config";
import { Tooltip } from "@eptss/ui";
import { HelpCircle } from "lucide-react";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface AutomationConfigEditorProps {
  automation: ProjectConfig["automation"];
  onChange: (automation: ProjectConfig["automation"]) => void;
}

export function AutomationConfigEditor({ automation, onChange }: AutomationConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          ⚡ Control which automated tasks run for this project. Cron jobs will check these settings before executing.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={automation.enableEmailReminders ?? true}
              onChange={(e) => onChange({ ...automation, enableEmailReminders: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Enable Email Reminders</span>
          </label>
          <Tooltip content={<div className="max-w-xs">Automated reminder emails for signups, voting deadlines, and submissions. Sent by cron job.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={automation.enableRoundAutoCreation ?? false}
              onChange={(e) => onChange({ ...automation, enableRoundAutoCreation: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Enable Round Auto-Creation</span>
          </label>
          <Tooltip content={<div className="max-w-xs">Automatically create future rounds based on schedule. Useful for recurring projects with predictable cadence.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={automation.enableSongAssignment ?? false}
              onChange={(e) => onChange({ ...automation, enableSongAssignment: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Enable Song Auto-Assignment</span>
          </label>
          <Tooltip content={<div className="max-w-xs">Automatically assign the winning song to the round after voting closes. Only applicable to cover projects.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>
      </div>

      <div className={!automation.enableRoundAutoCreation ? "opacity-50" : ""}>
        <LabelWithTooltip
          label="Round Creation Lead Time (days)"
          tooltip="How many days before a round starts should it be auto-created. Only applies when Round Auto-Creation is enabled."
        />
        <input
          type="number"
          min="1"
          max="90"
          value={automation.roundCreationLeadTimeDays ?? 30}
          onChange={(e) =>
            onChange({ ...automation, roundCreationLeadTimeDays: parseInt(e.target.value) || 30 })
          }
          disabled={!automation.enableRoundAutoCreation}
          className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
        />
        {!automation.enableRoundAutoCreation && (
          <p className="text-xs text-secondary mt-1">⚠️ Enable Round Auto-Creation above to use this setting</p>
        )}
      </div>
    </div>
  );
}
