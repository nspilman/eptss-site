import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface RoundInfoLabelsEditorProps {
  labels: ProjectConfig["content"]["pages"]["home"]["roundInfo"];
  onChange: (labels: ProjectConfig["content"]["pages"]["home"]["roundInfo"]) => void;
}

export function RoundInfoLabelsEditor({ labels, onChange }: RoundInfoLabelsEditorProps) {
  const phases = ['signups', 'voting', 'covering', 'celebration', 'loading'] as const;

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const hasTitle = phase === 'signups' || phase === 'voting' || phase === 'loading';
        const hasTitleFallback = phase === 'covering' || phase === 'celebration';
        const hasClosesPrefix = phase !== 'loading'; // loading phase doesn't have closesPrefix

        return (
          <div key={phase} className="p-4 bg-background-secondary rounded-lg space-y-3">
            <h5 className="text-sm font-semibold uppercase text-secondary">{phase} Phase</h5>
            <div>
              <LabelWithTooltip label="Badge Text" tooltip="Text shown in the badge" />
              <input
                type="text"
                value={labels[phase].badge}
                onChange={(e) => onChange({
                  ...labels,
                  [phase]: { ...labels[phase], badge: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
            </div>

            {hasTitle && (
              <div>
                <LabelWithTooltip label="Title" tooltip="Main title text" />
                <input
                  type="text"
                  value={'title' in labels[phase] ? labels[phase].title : ''}
                  onChange={(e) => onChange({
                    ...labels,
                    [phase]: { ...labels[phase], title: e.target.value } as any
                  })}
                  className="w-full px-3 py-2 rounded border border-border bg-background"
                />
              </div>
            )}

            {hasTitleFallback && (
              <div>
                <LabelWithTooltip label="Title Fallback" tooltip="Fallback title if song title is not available" />
                <input
                  type="text"
                  value={'titleFallback' in labels[phase] ? labels[phase].titleFallback : ''}
                  onChange={(e) => onChange({
                    ...labels,
                    [phase]: { ...labels[phase], titleFallback: e.target.value } as any
                  })}
                  className="w-full px-3 py-2 rounded border border-border bg-background"
                />
              </div>
            )}

            <div>
              <LabelWithTooltip label="Subtitle" tooltip="Subtitle text" />
              <input
                type="text"
                value={labels[phase].subtitle}
                onChange={(e) => onChange({
                  ...labels,
                  [phase]: { ...labels[phase], subtitle: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
            </div>

            {hasClosesPrefix && (
              <div>
                <LabelWithTooltip label="Closes Prefix" tooltip="Text before the closing date (e.g., 'Signups close')" />
                <input
                  type="text"
                  value={'closesPrefix' in labels[phase] ? labels[phase].closesPrefix : ''}
                  onChange={(e) => onChange({
                    ...labels,
                    [phase]: { ...labels[phase], closesPrefix: e.target.value } as any
                  })}
                  className="w-full px-3 py-2 rounded border border-border bg-background"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
