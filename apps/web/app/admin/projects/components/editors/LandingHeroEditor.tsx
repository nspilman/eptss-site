import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface LandingHeroEditorProps {
  hero: ProjectConfig["content"]["pages"]["home"]["hero"];
  onChange: (hero: ProjectConfig["content"]["pages"]["home"]["hero"]) => void;
}

export function LandingHeroEditor({ hero, onChange }: LandingHeroEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <LabelWithTooltip
          label="Tagline"
          tooltip="Small text above the main title (e.g., 'Quarterly Music Challenge')"
        />
        <input
          type="text"
          value={hero.tagline}
          onChange={(e) => onChange({ ...hero, tagline: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Quarterly Music Challenge"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Title"
          tooltip="First part of main headline"
        />
        <input
          type="text"
          value={hero.title}
          onChange={(e) => onChange({ ...hero, title: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Join Musicians Worldwide"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Subtitle"
          tooltip="Second part of main headline (shown with gradient)"
        />
        <input
          type="text"
          value={hero.subtitle}
          onChange={(e) => onChange({ ...hero, subtitle: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="Covering the Same Song"
        />
      </div>
      <div>
        <LabelWithTooltip
          label="Description"
          tooltip="Supporting text below the headline"
        />
        <textarea
          value={hero.description}
          onChange={(e) => onChange({ ...hero, description: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          rows={3}
          placeholder="Every round, we vote on a song, then everyone creates their own unique cover..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip
            label="Primary CTA Button"
            tooltip="Text for the main call-to-action button"
          />
          <input
            type="text"
            value={hero.ctaPrimary}
            onChange={(e) => onChange({ ...hero, ctaPrimary: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Join Next Round"
          />
        </div>
        <div>
          <LabelWithTooltip
            label="Secondary CTA Button"
            tooltip="Text for the secondary call-to-action button"
          />
          <input
            type="text"
            value={hero.ctaSecondary}
            onChange={(e) => onChange({ ...hero, ctaSecondary: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="How It Works"
          />
        </div>
      </div>
      <div>
        <LabelWithTooltip
          label="Benefits Text"
          tooltip="Small text below CTAs highlighting benefits"
        />
        <input
          type="text"
          value={hero.benefits}
          onChange={(e) => onChange({ ...hero, benefits: e.target.value })}
          className="w-full px-3 py-2 rounded border border-border bg-background"
          placeholder="✨ Free to join • 🎵 All skill levels welcome • 🌍 Global community"
        />
      </div>
    </div>
  );
}
