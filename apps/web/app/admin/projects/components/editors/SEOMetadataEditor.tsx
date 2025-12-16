import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface SEOMetadataEditorProps {
  seo: ProjectConfig["seo"];
  onChange: (seo: ProjectConfig["seo"]) => void;
}

export function SEOMetadataEditor({ seo, onChange }: SEOMetadataEditorProps) {
  return (
    <div className="space-y-6">
      {/* Landing Page SEO */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Landing Page</h4>
        <div>
          <LabelWithTooltip
            label="Page Title"
            tooltip="Title shown in browser tabs and search results. Keep under 60 characters for best SEO."
          />
          <input
            type="text"
            value={seo.landingPage.title}
            onChange={(e) => onChange({ ...seo, landingPage: { ...seo.landingPage, title: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Everyone Plays the Same Song | Quarterly Cover Challenge"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Meta Description"
            tooltip="Description shown in search results. Keep under 160 characters for best SEO."
          />
          <textarea
            value={seo.landingPage.description}
            onChange={(e) => onChange({ ...seo, landingPage: { ...seo.landingPage, description: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="Join our quarterly cover challenge..."
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Open Graph Title (optional)"
            tooltip="Title shown when shared on social media. If empty, uses Page Title."
          />
          <input
            type="text"
            value={seo.landingPage.ogTitle || ""}
            onChange={(e) => onChange({ ...seo, landingPage: { ...seo.landingPage, ogTitle: e.target.value || undefined } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Leave empty to use Page Title"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Open Graph Description (optional)"
            tooltip="Description shown when shared on social media. If empty, uses Meta Description."
          />
          <textarea
            value={seo.landingPage.ogDescription || ""}
            onChange={(e) => onChange({ ...seo, landingPage: { ...seo.landingPage, ogDescription: e.target.value || undefined } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="Leave empty to use Meta Description"
          />
        </div>
      </div>

      {/* Submit Page SEO */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Submit Page</h4>
        <div>
          <LabelWithTooltip
            label="Page Title"
            tooltip="Title for the submission page."
          />
          <input
            type="text"
            value={seo.submitPage.title}
            onChange={(e) => onChange({ ...seo, submitPage: { ...seo.submitPage, title: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Submit Your Cover | Everyone Plays the Same Song"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Meta Description"
            tooltip="Description for the submission page."
          />
          <textarea
            value={seo.submitPage.description}
            onChange={(e) => onChange({ ...seo, submitPage: { ...seo.submitPage, description: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="Submit your cover for this round..."
          />
        </div>
      </div>

      {/* Dashboard Page SEO */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Dashboard Page</h4>
        <div>
          <LabelWithTooltip
            label="Page Title"
            tooltip="Title for the dashboard page."
          />
          <input
            type="text"
            value={seo.dashboardPage.title}
            onChange={(e) => onChange({ ...seo, dashboardPage: { ...seo.dashboardPage, title: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Dashboard | Everyone Plays the Same Song"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Meta Description"
            tooltip="Description for the dashboard page."
          />
          <textarea
            value={seo.dashboardPage.description}
            onChange={(e) => onChange({ ...seo, dashboardPage: { ...seo.dashboardPage, description: e.target.value } })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="View round status and participate..."
          />
        </div>
      </div>
    </div>
  );
}
