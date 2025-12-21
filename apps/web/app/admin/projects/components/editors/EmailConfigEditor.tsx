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
        <div className="space-y-6">
          {Object.entries(email.templates).map(([key, template]) => (
            <div key={key} className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
              <h4 className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Subject Line</label>
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
                    className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Greeting</label>
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
                    className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                  />
                </div>
              </div>

              {/* Additional fields for signup confirmation */}
              {key === 'signupConfirmation' && (() => {
                const signupTemplate = template as any;
                return (
                  <>
                    <div>
                      <LabelWithTooltip
                        label="Custom Instructions (optional)"
                        tooltip="Additional instructions or information to include in the signup confirmation email. This appears after the phase timeline. Use this to provide round-specific guidance, links to resources, or special instructions."
                      />
                      <textarea
                        value={signupTemplate.instructions || ""}
                        onChange={(e) =>
                          onChange({
                            ...email,
                            templates: {
                              ...email.templates,
                              [key]: {
                                ...signupTemplate,
                                instructions: e.target.value || undefined
                              } as any,
                            },
                          })
                        }
                        placeholder="e.g., 'Check out our Discord for collaboration tips!' or 'Remember to review the songwriting guidelines.'"
                        className="w-full px-3 py-2 rounded border border-border bg-background text-sm min-h-[80px]"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <LabelWithTooltip
                          label="CTA Button Text (optional)"
                          tooltip="Text for the call-to-action button. Defaults to 'View Round Details' if not specified."
                        />
                        <input
                          type="text"
                          value={signupTemplate.ctaButtonText || ""}
                          onChange={(e) =>
                            onChange({
                              ...email,
                              templates: {
                                ...email.templates,
                                [key]: {
                                  ...signupTemplate,
                                  ctaButtonText: e.target.value || undefined
                                } as any,
                              },
                            })
                          }
                          placeholder="View Round Details"
                          className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <LabelWithTooltip
                          label="CTA Button URL (optional)"
                          tooltip="Custom URL for the call-to-action button. Defaults to the round page if not specified. Use this to link to Discord, guides, or other resources."
                        />
                        <input
                          type="url"
                          value={signupTemplate.ctaButtonUrl || ""}
                          onChange={(e) =>
                            onChange({
                              ...email,
                              templates: {
                                ...email.templates,
                                [key]: {
                                  ...signupTemplate,
                                  ctaButtonUrl: e.target.value || undefined
                                } as any,
                              },
                            })
                          }
                          placeholder="https://example.com/resources"
                          className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
