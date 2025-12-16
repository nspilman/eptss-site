import type { ProjectConfig } from "@eptss/project-config";
import { Tooltip } from "@eptss/ui";
import { HelpCircle } from "lucide-react";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface BusinessRulesEditorProps {
  rules: ProjectConfig["businessRules"];
  onChange: (rules: ProjectConfig["businessRules"]) => void;
  features: ProjectConfig["features"];
}

export function BusinessRulesEditor({ rules, onChange, features }: BusinessRulesEditorProps) {
  const votingEnabled = features.enableVoting ?? true;
  const submissionsEnabled = features.enableSubmissions ?? true;

  const disabledFeatures = [];
  if (!votingEnabled) disabledFeatures.push("Voting");
  if (!submissionsEnabled) disabledFeatures.push("Submissions");

  return (
    <div className="space-y-4">
      {disabledFeatures.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-600">
                Some settings are disabled because these features are turned off:
              </p>
              <div className="flex gap-2 mt-2">
                {disabledFeatures.map((feature) => (
                  <span key={feature} className="text-xs bg-orange-500/20 text-orange-700 px-2 py-1 rounded font-medium">
                    {feature}
                  </span>
                ))}
              </div>
              <p className="text-xs text-secondary mt-2">
                Enable these features in the "Features & Functionality" section above to use their related settings.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={!submissionsEnabled ? "opacity-50" : ""}>
          <LabelWithTooltip
            label="Max Submissions Per Round"
            tooltip="Limits how many submissions a user can make per round. Higher values allow users to submit multiple entries."
          />
          <input
            type="number"
            min="1"
            value={rules.maxSubmissionsPerRound}
            onChange={(e) =>
              onChange({ ...rules, maxSubmissionsPerRound: parseInt(e.target.value) || 1 })
            }
            disabled={!submissionsEnabled}
            className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
          />
          {!submissionsEnabled && (
            <p className="text-xs text-secondary mt-1">⚠️ Enable Submissions to use this setting</p>
          )}
        </div>
        <div className={!votingEnabled ? "opacity-50" : ""}>
          <LabelWithTooltip
            label="Max Votes Per User"
            tooltip="Limits how many votes each user can cast in voting rounds. Users will see their remaining votes. Affects how democratic the voting process is."
          />
          <input
            type="number"
            min="1"
            value={rules.maxVotesPerUser}
            onChange={(e) => onChange({ ...rules, maxVotesPerUser: parseInt(e.target.value) || 1 })}
            disabled={!votingEnabled}
            className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
          />
          {!votingEnabled && (
            <p className="text-xs text-secondary mt-1">⚠️ Enable Voting to use this setting</p>
          )}
        </div>
        <div className={!votingEnabled ? "opacity-50" : ""}>
          <LabelWithTooltip
            label="Min Voting Duration (days)"
            tooltip="Minimum length for voting phases. Ensures voting periods are not too short. Enforced when admins create rounds."
          />
          <input
            type="number"
            min="1"
            value={rules.minVotingDurationDays}
            onChange={(e) =>
              onChange({ ...rules, minVotingDurationDays: parseInt(e.target.value) || 1 })
            }
            disabled={!votingEnabled}
            className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
          />
          {!votingEnabled && (
            <p className="text-xs text-secondary mt-1">⚠️ Enable Voting to use this setting</p>
          )}
        </div>
        <div className={!votingEnabled ? "opacity-50" : ""}>
          <LabelWithTooltip
            label="Max Voting Duration (days)"
            tooltip="Maximum length for voting phases. Ensures voting periods don't become stale. Maintains project momentum."
          />
          <input
            type="number"
            min="1"
            value={rules.maxVotingDurationDays}
            onChange={(e) =>
              onChange({ ...rules, maxVotingDurationDays: parseInt(e.target.value) || 1 })
            }
            disabled={!votingEnabled}
            className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
          />
          {!votingEnabled && (
            <p className="text-xs text-secondary mt-1">⚠️ Enable Voting to use this setting</p>
          )}
        </div>
        <div>
          <LabelWithTooltip
            label="Default Round Duration (weeks)"
            tooltip="Suggested duration for a complete round cycle. Pre-fills round creation form in admin panel. Admins can override on per-round basis."
          />
          <input
            type="number"
            min="1"
            value={rules.defaultRoundDurationWeeks}
            onChange={(e) =>
              onChange({ ...rules, defaultRoundDurationWeeks: parseInt(e.target.value) || 1 })
            }
            className="w-full px-3 py-2 rounded border border-border bg-background"
          />
        </div>
        <div className={!rules.allowLateSubmissions ? "opacity-50" : ""}>
          <LabelWithTooltip
            label="Late Submission Grace Period (hours)"
            tooltip="How many hours after deadline late submissions are accepted. Only applies when 'Allow Late Submissions' is enabled. 0 means no grace period."
          />
          <input
            type="number"
            min="0"
            value={rules.lateSubmissionGracePeriodHours}
            onChange={(e) =>
              onChange({ ...rules, lateSubmissionGracePeriodHours: parseInt(e.target.value) || 0 })
            }
            disabled={!rules.allowLateSubmissions}
            className="w-full px-3 py-2 rounded border border-border bg-background disabled:cursor-not-allowed"
          />
          {!rules.allowLateSubmissions && (
            <p className="text-xs text-secondary mt-1">⚠️ Enable Allow Late Submissions below to use this</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={rules.requireEmailVerification}
              onChange={(e) => onChange({ ...rules, requireEmailVerification: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Require Email Verification</span>
          </label>
          <Tooltip content={<div className="max-w-xs">When enabled, users must verify their email before participating. Increases security but adds friction to signup.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={rules.requireSongOnSignup}
              onChange={(e) => onChange({ ...rules, requireSongOnSignup: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Require Song on Signup</span>
          </label>
          <Tooltip content={<div className="max-w-xs">When enabled, signup form shows song selection fields. When disabled, users only provide personal info and can add songs later. Critical for projects like Monthly Original Songs.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={rules.allowLateSubmissions}
              onChange={(e) => onChange({ ...rules, allowLateSubmissions: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Allow Late Submissions</span>
          </label>
          <Tooltip content={<div className="max-w-xs">When enabled, submissions are accepted during the grace period after deadline. Provides flexibility for users in different time zones.</div>} side="right">
            <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors flex-shrink-0" />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
