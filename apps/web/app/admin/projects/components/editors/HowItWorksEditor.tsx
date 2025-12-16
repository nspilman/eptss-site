import type { ProjectConfig } from "@eptss/project-config";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface HowItWorksEditorProps {
  howItWorks: ProjectConfig["content"]["pages"]["home"]["howItWorks"];
  onChange: (howItWorks: ProjectConfig["content"]["pages"]["home"]["howItWorks"]) => void;
}

export function HowItWorksEditor({ howItWorks, onChange }: HowItWorksEditorProps) {
  const iconOptions = ["music", "lightbulb", "calendar", "users", "mic", "award", "heart", "sparkles"] as const;

  return (
    <div className="space-y-6">
      {/* Section Headers */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Section Headers</h4>
        <div>
          <LabelWithTooltip label="Section Title" tooltip="Main title for the 'How It Works' section" />
          <input
            type="text"
            value={howItWorks.sectionTitle}
            onChange={(e) => onChange({ ...howItWorks, sectionTitle: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="How It Works"
          />
        </div>
        <div>
          <LabelWithTooltip label="Section Subtitle" tooltip="Subtitle below the section title" />
          <input
            type="text"
            value={howItWorks.sectionSubtitle}
            onChange={(e) => onChange({ ...howItWorks, sectionSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="A simple process designed to spark your creativity"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Steps</h4>
        {(['step1', 'step2', 'step3'] as const).map((stepKey) => (
          <div key={stepKey} className="p-4 bg-background-secondary rounded-lg space-y-3">
            <h5 className="text-xs font-semibold uppercase text-secondary">{stepKey.replace('step', 'Step ')}</h5>
            <div>
              <LabelWithTooltip label="Icon" tooltip="Icon shown for this step" />
              <select
                value={howItWorks.steps[stepKey].icon}
                onChange={(e) => onChange({
                  ...howItWorks,
                  steps: {
                    ...howItWorks.steps,
                    [stepKey]: { ...howItWorks.steps[stepKey], icon: e.target.value as any }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <LabelWithTooltip label="Title" tooltip="Step title" />
              <input
                type="text"
                value={howItWorks.steps[stepKey].title}
                onChange={(e) => onChange({
                  ...howItWorks,
                  steps: {
                    ...howItWorks.steps,
                    [stepKey]: { ...howItWorks.steps[stepKey], title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
            </div>
            <div>
              <LabelWithTooltip label="Description" tooltip="Step description" />
              <textarea
                value={howItWorks.steps[stepKey].description}
                onChange={(e) => onChange({
                  ...howItWorks,
                  steps: {
                    ...howItWorks.steps,
                    [stepKey]: { ...howItWorks.steps[stepKey], description: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Benefits</h4>
        <div>
          <LabelWithTooltip label="Benefits Title" tooltip="Title for the benefits section" />
          <input
            type="text"
            value={howItWorks.benefits.benefitsTitle}
            onChange={(e) => onChange({
              ...howItWorks,
              benefits: { ...howItWorks.benefits, benefitsTitle: e.target.value }
            })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Why Musicians Love Us"
          />
        </div>
        {(['benefit1', 'benefit2', 'benefit3'] as const).map((benefitKey) => (
          <div key={benefitKey} className="p-4 bg-background-secondary rounded-lg space-y-3">
            <h5 className="text-xs font-semibold uppercase text-secondary">{benefitKey.replace('benefit', 'Benefit ')}</h5>
            <div>
              <LabelWithTooltip label="Icon" tooltip="Icon shown for this benefit" />
              <select
                value={howItWorks.benefits[benefitKey].icon}
                onChange={(e) => onChange({
                  ...howItWorks,
                  benefits: {
                    ...howItWorks.benefits,
                    [benefitKey]: { ...howItWorks.benefits[benefitKey], icon: e.target.value as any }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <LabelWithTooltip label="Title" tooltip="Benefit title" />
              <input
                type="text"
                value={howItWorks.benefits[benefitKey].title}
                onChange={(e) => onChange({
                  ...howItWorks,
                  benefits: {
                    ...howItWorks.benefits,
                    [benefitKey]: { ...howItWorks.benefits[benefitKey], title: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
            </div>
            <div>
              <LabelWithTooltip label="Description" tooltip="Benefit description" />
              <textarea
                value={howItWorks.benefits[benefitKey].description}
                onChange={(e) => onChange({
                  ...howItWorks,
                  benefits: {
                    ...howItWorks.benefits,
                    [benefitKey]: { ...howItWorks.benefits[benefitKey], description: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 rounded border border-border bg-background"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Testimonial</h4>
        <div>
          <LabelWithTooltip label="Quote" tooltip="Testimonial quote text" />
          <textarea
            value={howItWorks.testimonial.quote}
            onChange={(e) => onChange({
              ...howItWorks,
              testimonial: { ...howItWorks.testimonial, quote: e.target.value }
            })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            rows={2}
            placeholder="This community has transformed my musical journey!"
          />
        </div>
        <div>
          <LabelWithTooltip label="Author" tooltip="Name of person who gave the testimonial" />
          <input
            type="text"
            value={howItWorks.testimonial.author}
            onChange={(e) => onChange({
              ...howItWorks,
              testimonial: { ...howItWorks.testimonial, author: e.target.value }
            })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Community Member"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="font-semibold text-sm">Call-to-Action</h4>
        <div>
          <LabelWithTooltip label="CTA Button Text" tooltip="Text for the main CTA button" />
          <input
            type="text"
            value={howItWorks.ctaButton}
            onChange={(e) => onChange({ ...howItWorks, ctaButton: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border bg-background"
            placeholder="Join Our Next Round"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip label="FAQ Link Text" tooltip="Text for FAQ link" />
            <input
              type="text"
              value={howItWorks.ctaLinks.faq}
              onChange={(e) => onChange({
                ...howItWorks,
                ctaLinks: { ...howItWorks.ctaLinks, faq: e.target.value }
              })}
              className="w-full px-3 py-2 rounded border border-border bg-background"
              placeholder="FAQ"
            />
          </div>
          <div>
            <LabelWithTooltip label="Past Rounds Link Text" tooltip="Text for past rounds link" />
            <input
              type="text"
              value={howItWorks.ctaLinks.pastRounds}
              onChange={(e) => onChange({
                ...howItWorks,
                ctaLinks: { ...howItWorks.ctaLinks, pastRounds: e.target.value }
              })}
              className="w-full px-3 py-2 rounded border border-border bg-background"
              placeholder="Past Rounds"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
