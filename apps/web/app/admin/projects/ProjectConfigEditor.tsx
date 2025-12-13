"use client";

import { useState, useEffect } from "react";
import { getAllProjects, type ProjectInfo } from "@eptss/data-access/services/projectService";
import { safeParseProjectConfig, type ProjectConfig } from "@eptss/project-config";
import { updateProjectConfig } from "./actions";
import { Loader2, Settings, Palette, Shield, Mail, FileText, ToggleLeft, HelpCircle, Zap } from "lucide-react";
import { Tooltip } from "@eptss/ui";

export function ProjectConfigEditor() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const allProjects = await getAllProjects();
        setProjects(allProjects);
        if (allProjects.length > 0) {
          setSelectedProject(allProjects[0]);
          setConfig(safeParseProjectConfig(allProjects[0].config));
        }
      } catch (err) {
        setError("Failed to load projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setConfig(safeParseProjectConfig(project.config));
      setSuccess(false);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!selectedProject || !config) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProjectConfig(selectedProject.id, config);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save configuration");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string[], value: any) => {
    if (!config) return;

    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    // Navigate to the parent of the field we want to update
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // Set the value
    current[path[path.length - 1]] = value;

    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Selector - Highlighted Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Project Selection</h2>
        </div>
        <label htmlFor="project-select" className="block text-sm font-semibold mb-2">
          Select Project to Configure
        </label>
        <select
          id="project-select"
          value={selectedProject?.id || ""}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-lg border-2 border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.slug})
            </option>
          ))}
        </select>
        <div className="flex items-center gap-4 mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedProject?.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
            {selectedProject?.isActive ? '● Active' : '○ Inactive'}
          </span>
          <span className="text-sm text-secondary">
            ID: {selectedProject?.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Config Editor */}
      {config && selectedProject && (
        <div className="space-y-8">
          {/* Features & Functionality Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ToggleLeft className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-bold text-purple-500 uppercase tracking-wide">Features & Functionality</h3>
            </div>
            <ConfigSection
              title="Feature Flags"
              description="Enable or disable features for this project"
              variant="purple"
              icon={<ToggleLeft className="h-5 w-5" />}
            >
              <FeatureFlagsEditor
                features={config.features}
                onChange={(features) => updateConfig(["features"], features)}
              />
            </ConfigSection>
          </div>

          {/* Design & Branding Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-bold text-pink-500 uppercase tracking-wide">Design & Branding</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ConfigSection
                title="UI Configuration"
                description="Customize colors and theme"
                variant="pink"
                icon={<Palette className="h-5 w-5" />}
              >
                <UIConfigEditor ui={config.ui} onChange={(ui) => updateConfig(["ui"], ui)} />
              </ConfigSection>
              <ConfigSection
                title="Project Metadata"
                description="Landing page information"
                variant="pink"
                icon={<FileText className="h-5 w-5" />}
              >
                <ProjectMetadataEditor
                  metadata={config.metadata}
                  onChange={(metadata) => updateConfig(["metadata"], metadata)}
                />
              </ConfigSection>
            </div>
          </div>

          {/* Rules & Constraints Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wide">Rules & Constraints</h3>
            </div>
            <ConfigSection
              title="Business Rules"
              description="Set constraints and limits"
              variant="orange"
              icon={<Shield className="h-5 w-5" />}
            >
              <BusinessRulesEditor
                rules={config.businessRules}
                onChange={(rules) => updateConfig(["businessRules"], rules)}
                features={config.features}
              />
            </ConfigSection>
          </div>

          {/* Communication Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold text-green-500 uppercase tracking-wide">Communication</h3>
            </div>
            <ConfigSection
              title="Email Configuration"
              description="Customize email templates"
              variant="green"
              icon={<Mail className="h-5 w-5" />}
            >
              <EmailConfigEditor
                email={config.email}
                onChange={(email) => updateConfig(["email"], email)}
              />
            </ConfigSection>
          </div>

          {/* Automation Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold text-blue-500 uppercase tracking-wide">Automation & Cron Jobs</h3>
            </div>
            <ConfigSection
              title="Automation Configuration"
              description="Configure automated tasks and background jobs"
              variant="blue"
              icon={<Zap className="h-5 w-5" />}
            >
              <AutomationConfigEditor
                automation={config.automation}
                onChange={(automation) => updateConfig(["automation"], automation)}
              />
            </ConfigSection>
          </div>

          {/* Save Button - Sticky at bottom */}
          <div className="sticky bottom-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-2xl border-2 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Save Configuration</h4>
                <p className="text-white/80 text-sm">Click to save all changes to {selectedProject.name}</p>
              </div>
              <div className="flex items-center gap-4">
                {success && (
                  <span className="flex items-center gap-2 text-green-300 font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
                    <span className="text-xl">✓</span> Saved successfully!
                  </span>
                )}
                {error && (
                  <span className="flex items-center gap-2 text-red-300 font-semibold bg-red-500/20 px-4 py-2 rounded-lg">
                    <span className="text-xl">✗</span> {error}
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                >
                  {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                  {saving ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for labels with tooltips
function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="block text-sm font-medium">{label}</label>
      <Tooltip content={<div className="max-w-xs">{tooltip}</div>} side="right">
        <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors" />
      </Tooltip>
    </div>
  );
}

// Section wrapper component with variants
function ConfigSection({
  title,
  description,
  children,
  variant = "default",
  icon,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: "purple" | "pink" | "orange" | "green" | "blue" | "default";
  icon?: React.ReactNode;
}) {
  const variantStyles = {
    purple: "bg-purple-500/5 border-2 border-purple-500/20 hover:border-purple-500/40",
    pink: "bg-pink-500/5 border-2 border-pink-500/20 hover:border-pink-500/40",
    orange: "bg-orange-500/5 border-2 border-orange-500/20 hover:border-orange-500/40",
    green: "bg-green-500/5 border-2 border-green-500/20 hover:border-green-500/40",
    blue: "bg-blue-500/5 border-2 border-blue-500/20 hover:border-blue-500/40",
    default: "bg-background-secondary border-2 border-border",
  };

  const iconColors = {
    purple: "text-purple-500",
    pink: "text-pink-500",
    orange: "text-orange-500",
    green: "text-green-500",
    blue: "text-blue-500",
    default: "text-primary",
  };

  return (
    <div className={`${variantStyles[variant]} rounded-xl p-6 transition-all duration-200 shadow-sm hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className={iconColors[variant]}>{icon}</span>}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-secondary mb-6">{description}</p>
      {children}
    </div>
  );
}

// Feature Flags Editor
function FeatureFlagsEditor({
  features,
  onChange,
}: {
  features: ProjectConfig["features"];
  onChange: (features: ProjectConfig["features"]) => void;
}) {
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

// UI Config Editor
function UIConfigEditor({
  ui,
  onChange,
}: {
  ui: ProjectConfig["ui"];
  onChange: (ui: ProjectConfig["ui"]) => void;
}) {
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

// Business Rules Editor
function BusinessRulesEditor({
  rules,
  onChange,
  features,
}: {
  rules: ProjectConfig["businessRules"];
  onChange: (rules: ProjectConfig["businessRules"]) => void;
  features: ProjectConfig["features"];
}) {
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

// Email Config Editor
function EmailConfigEditor({
  email,
  onChange,
}: {
  email: ProjectConfig["email"];
  onChange: (email: ProjectConfig["email"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <LabelWithTooltip
          label="From Name"
          tooltip="Name that appears in the 'From' field of all project emails. Should match project branding to help users identify legitimate emails."
        />
        <input
          type="text"
          value={email.fromName}
          onChange={(e) => onChange({ ...email, fromName: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="EPTSS"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Reply To Email (optional)"
          tooltip="Email address where replies are sent when users hit 'reply'. Should be a monitored mailbox for user responses. Can differ from sender for better deliverability."
        />
        <input
          type="email"
          value={email.replyToEmail || ""}
          onChange={(e) => onChange({ ...email, replyToEmail: e.target.value || undefined })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="reply@example.com"
        />
      </div>
      <div className="border-t border-border pt-4 mt-4">
        <h3 className="font-semibold mb-3">Email Templates</h3>
        <div className="space-y-4">
          {Object.entries(email.templates).map(([key, template]) => (
            <div key={key} className="space-y-2">
              <h4 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) =>
                    onChange({
                      ...email,
                      templates: {
                        ...email.templates,
                        [key]: { ...template, subject: e.target.value },
                      },
                    })
                  }
                  placeholder="Subject"
                  className="px-3 py-2 rounded border border-border bg-background text-sm"
                />
                <input
                  type="text"
                  value={template.greeting}
                  onChange={(e) =>
                    onChange({
                      ...email,
                      templates: {
                        ...email.templates,
                        [key]: { ...template, greeting: e.target.value },
                      },
                    })
                  }
                  placeholder="Greeting"
                  className="px-3 py-2 rounded border border-border bg-background text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project Metadata Editor
function ProjectMetadataEditor({
  metadata,
  onChange,
}: {
  metadata: ProjectConfig["metadata"];
  onChange: (metadata: ProjectConfig["metadata"]) => void;
}) {
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

// Automation Config Editor
function AutomationConfigEditor({
  automation,
  onChange,
}: {
  automation: ProjectConfig["automation"];
  onChange: (automation: ProjectConfig["automation"]) => void;
}) {
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
