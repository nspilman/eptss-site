import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface SubmissionsGalleryEditorProps {
  gallery: ProjectConfig["content"]["pages"]["home"]["submissionsGallery"];
  onChange: (gallery: ProjectConfig["content"]["pages"]["home"]["submissionsGallery"]) => void;
}

export function SubmissionsGalleryEditor({ gallery, onChange }: SubmissionsGalleryEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <LabelWithTooltip
          label="Section Title"
          tooltip="Main title for the submissions gallery section"
        />
        <input
          type="text"
          value={gallery.title}
          onChange={(e) => onChange({ ...gallery, title: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Past Submissions"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Subtitle"
          tooltip="Subtitle below the section title"
        />
        <input
          type="text"
          value={gallery.subtitle}
          onChange={(e) => onChange({ ...gallery, subtitle: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Browse previous rounds and community creations"
        />
      </div>
      <div className="border-t border-border pt-4 space-y-4">
        <h4 className="font-semibold text-sm">Empty State</h4>
        <div>
          <LabelWithTooltip
            label="Empty State Title"
            tooltip="Title shown when there are no submissions yet"
          />
          <input
            type="text"
            value={gallery.emptyStateTitle}
            onChange={(e) => onChange({ ...gallery, emptyStateTitle: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="No Past Rounds Yet"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Empty State Message"
            tooltip="Message shown when there are no submissions yet"
          />
          <textarea
            value={gallery.emptyStateMessage}
            onChange={(e) => onChange({ ...gallery, emptyStateMessage: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="Be part of the first round!"
          />
        </div>
      </div>
      <div>
        <LabelWithTooltip
          label="View All Link Text"
          tooltip="Text for the 'View All' link at the bottom"
        />
        <input
          type="text"
          value={gallery.viewAllLink}
          onChange={(e) => onChange({ ...gallery, viewAllLink: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="View All Rounds →"
        />
      </div>
    </div>
  );
}
