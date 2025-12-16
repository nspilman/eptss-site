import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface SubmitPageEditorProps {
  submitContent: ProjectConfig["content"]["pages"]["submit"];
  onChange: (submitContent: ProjectConfig["content"]["pages"]["submit"]) => void;
}

export function SubmitPageEditor({ submitContent, onChange }: SubmitPageEditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 Use <code className="bg-blue-500/20 px-1 rounded">{'{{songTitle}}'}</code> and <code className="bg-blue-500/20 px-1 rounded">{'{{songArtist}}'}</code> as placeholders in form titles
        </p>
      </div>

      <div>
        <LabelWithTooltip
          label="Form Title (with song)"
          tooltip="Title shown when a song has been selected. Use {{songTitle}} and {{songArtist}} placeholders."
        />
        <input
          type="text"
          value={submitContent.formTitleWithSong}
          onChange={(e) => onChange({ ...submitContent, formTitleWithSong: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background font-mono text-sm"
          placeholder="Submit Your Cover of '{{songTitle}}' by {{songArtist}}"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Form Title (no song)"
          tooltip="Title shown when no song has been selected yet"
        />
        <input
          type="text"
          value={submitContent.formTitleNoSong}
          onChange={(e) => onChange({ ...submitContent, formTitleNoSong: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Submit Your Original Song"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Form Description Prefix"
          tooltip="Text shown before the deadline date"
        />
        <input
          type="text"
          value={submitContent.formDescriptionPrefix}
          onChange={(e) => onChange({ ...submitContent, formDescriptionPrefix: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Submit your entry by"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Submit Button Text"
          tooltip="Text for the submit button"
        />
        <input
          type="text"
          value={submitContent.submitButtonText}
          onChange={(e) => onChange({ ...submitContent, submitButtonText: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Submit Cover"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Submitting Text"
          tooltip="Text shown on button while submitting"
        />
        <input
          type="text"
          value={submitContent.submittingText}
          onChange={(e) => onChange({ ...submitContent, submittingText: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Submitting..."
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Success Message"
          tooltip="Message shown after successful submission"
        />
        <textarea
          value={submitContent.successMessage}
          onChange={(e) => onChange({ ...submitContent, successMessage: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          rows={2}
          placeholder="Your cover has been submitted successfully!"
        />
      </div>
    </div>
  );
}
