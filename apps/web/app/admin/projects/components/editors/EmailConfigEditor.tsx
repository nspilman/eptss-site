import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface EmailConfigEditorProps {
  email: ProjectConfig["email"];
  onChange: (email: ProjectConfig["email"]) => void;
}

export function EmailConfigEditor({ email, onChange }: EmailConfigEditorProps) {
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
