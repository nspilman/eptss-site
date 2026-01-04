import type { ProjectConfig, SubmissionFormConfig } from "@eptss/project-config";
import { Text, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eptss/ui";
import { LabelWithTooltip } from "../LabelWithTooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SubmissionFormEditorProps {
  submissionForm: ProjectConfig["submissionForm"];
  onChange: (submissionForm: ProjectConfig["submissionForm"]) => void;
}

type FieldKey = keyof SubmissionFormConfig["fields"];

interface FieldDefinition {
  key: FieldKey;
  label: string;
  tooltip: string;
  type: "file" | "textarea";
  hasMaxSize?: boolean;
  hasCrop?: boolean;
  hasMaxLength?: boolean;
}

const fieldDefinitions: FieldDefinition[] = [
  {
    key: "audioFile",
    label: "Audio File",
    tooltip: "Audio submission file upload. This is typically the main content of a submission.",
    type: "file",
    hasMaxSize: true,
  },
  {
    key: "coverImage",
    label: "Cover Image",
    tooltip: "Album art or cover image for the submission. Can be cropped before upload.",
    type: "file",
    hasMaxSize: true,
    hasCrop: true,
  },
  {
    key: "lyrics",
    label: "Lyrics",
    tooltip: "Text area for original song lyrics. Primarily used for the originals project.",
    type: "textarea",
    hasMaxLength: true,
  },
  {
    key: "coolThingsLearned",
    label: "Cool Things Learned",
    tooltip: "Narrative field where users share what they learned during the creative process.",
    type: "textarea",
  },
  {
    key: "toolsUsed",
    label: "Tools Used",
    tooltip: "Narrative field where users list the tools, software, or instruments they used.",
    type: "textarea",
  },
  {
    key: "happyAccidents",
    label: "Happy Accidents",
    tooltip: "Narrative field for unexpected positive discoveries during the creative process.",
    type: "textarea",
  },
  {
    key: "didntWork",
    label: "What Didn't Work",
    tooltip: "Narrative field for sharing challenges or things that didn't go as planned.",
    type: "textarea",
  },
];

function FieldEditor({
  fieldDef,
  config,
  onChange,
  allFields,
  existingGroups,
}: {
  fieldDef: FieldDefinition;
  config: SubmissionFormConfig["fields"][FieldKey];
  onChange: (updated: SubmissionFormConfig["fields"][FieldKey]) => void;
  allFields: SubmissionFormConfig["fields"];
  existingGroups: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasRequiredGroup = !!config.requiredGroup;

  // Get other enabled fields that could be paired with this one
  const otherFields = fieldDefinitions.filter(
    (f) => f.key !== fieldDef.key && (allFields[f.key]?.enabled ?? true)
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.enabled ?? true}
            onChange={(e) => {
              e.stopPropagation();
              onChange({ ...config, enabled: e.target.checked });
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div className="text-left">
            <Text size="sm" weight="medium">{fieldDef.label}</Text>
            <Text size="xs" color="secondary" className="mt-0.5">
              {config.enabled ? (
                config.required ? "Required" : hasRequiredGroup ? `Required group: ${config.requiredGroup}` : "Optional"
              ) : (
                "Disabled"
              )}
            </Text>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-secondary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-secondary" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-4 bg-muted/20">
          <Text size="xs" color="secondary" className="mb-3">
            {fieldDef.tooltip}
          </Text>

          {/* Required / Required Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.required ?? false}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      required: e.target.checked,
                      requiredGroup: e.target.checked ? undefined : config.requiredGroup,
                    })
                  }
                  disabled={!config.enabled}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                />
                <Text size="sm">Required</Text>
              </label>
              <Text size="xs" color="secondary" className="mt-1 ml-6">
                This field must be filled out
              </Text>
            </div>

            <div className={config.required ? "opacity-50" : ""}>
              <LabelWithTooltip
                label="Required Group"
                tooltip="Fields in the same required group form an OR relationship - at least one must be provided."
              />
              <Select
                value={config.requiredGroup ?? "none"}
                onValueChange={(value) =>
                  onChange({
                    ...config,
                    requiredGroup: value === "none" ? undefined : value,
                    required: value !== "none" ? false : config.required,
                  })
                }
                disabled={!config.enabled || config.required}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (not in a group)</SelectItem>
                  {existingGroups.length > 0 && (
                    <>
                      {existingGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          Join group: {group}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {otherFields.length > 0 && (
                    <>
                      {otherFields
                        .filter((f) => !existingGroups.includes(`${fieldDef.key}-or-${f.key}`) && !existingGroups.includes(`${f.key}-or-${fieldDef.key}`))
                        .map((f) => (
                          <SelectItem key={f.key} value={`${fieldDef.key}-or-${f.key}`}>
                            New group with {f.label}
                          </SelectItem>
                        ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Label & Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LabelWithTooltip
                label="Custom Label"
                tooltip="Override the default field label. Leave empty to use the default."
              />
              <input
                type="text"
                value={config.label ?? ""}
                onChange={(e) => onChange({ ...config, label: e.target.value || undefined })}
                disabled={!config.enabled}
                placeholder={fieldDef.label}
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <LabelWithTooltip
                label="Placeholder Text"
                tooltip="Custom placeholder text shown in the input field."
              />
              <input
                type="text"
                value={config.placeholder ?? ""}
                onChange={(e) => onChange({ ...config, placeholder: e.target.value || undefined })}
                disabled={!config.enabled}
                placeholder="Enter placeholder text..."
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <LabelWithTooltip
              label="Description"
              tooltip="Helper text displayed below the field to guide users."
            />
            <input
              type="text"
              value={config.description ?? ""}
              onChange={(e) => onChange({ ...config, description: e.target.value || undefined })}
              disabled={!config.enabled}
              placeholder="Enter helper text..."
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* File-specific options */}
          {fieldDef.hasMaxSize && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <LabelWithTooltip
                  label="Max File Size (MB)"
                  tooltip="Maximum allowed file size in megabytes."
                />
                <input
                  type="number"
                  min="1"
                  value={(config as any).maxSizeMB ?? (fieldDef.key === "audioFile" ? 50 : 5)}
                  onChange={(e) =>
                    onChange({ ...config, maxSizeMB: parseInt(e.target.value) || 5 } as any)
                  }
                  disabled={!config.enabled}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {fieldDef.hasCrop && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={(config as any).enableCrop ?? true}
                      onChange={(e) =>
                        onChange({ ...config, enableCrop: e.target.checked } as any)
                      }
                      disabled={!config.enabled}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                    <Text size="sm">Enable Image Cropping</Text>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Textarea-specific options */}
          {fieldDef.hasMaxLength && (
            <div>
              <LabelWithTooltip
                label="Max Character Length"
                tooltip="Maximum number of characters allowed. Leave empty for no limit."
              />
              <input
                type="number"
                min="1"
                value={(config as any).maxLength ?? ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  } as any)
                }
                disabled={!config.enabled}
                placeholder="No limit"
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SubmissionFormEditor({ submissionForm, onChange }: SubmissionFormEditorProps) {
  const updateField = (key: FieldKey, updated: SubmissionFormConfig["fields"][FieldKey]) => {
    onChange({
      ...submissionForm,
      fields: {
        ...submissionForm.fields,
        [key]: updated,
      },
    });
  };

  // Find all unique required groups for display
  const requiredGroups = new Set<string>();
  for (const fieldConfig of Object.values(submissionForm.fields)) {
    if (fieldConfig.requiredGroup) {
      requiredGroups.add(fieldConfig.requiredGroup);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <Text size="sm" className="text-blue-600">
          Configure which fields appear on the submission form and their validation rules.
          Fields with the same "Required Group" form an OR relationship - at least one must be filled.
        </Text>
      </div>

      {requiredGroups.size > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Text size="xs" color="secondary">Active required groups:</Text>
          {Array.from(requiredGroups).map((group) => (
            <span
              key={group}
              className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded"
            >
              {group}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {fieldDefinitions.map((fieldDef) => (
          <FieldEditor
            key={fieldDef.key}
            fieldDef={fieldDef}
            config={submissionForm.fields[fieldDef.key]}
            onChange={(updated) => updateField(fieldDef.key, updated)}
            allFields={submissionForm.fields}
            existingGroups={Array.from(requiredGroups)}
          />
        ))}
      </div>
    </div>
  );
}
