import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Button from '../../src/components/ui/primitives/button';
import { ThemeSection } from './ThemeSection';

const meta: Meta<typeof Button> = {
  title: 'Components/Button/AsChild Usage',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The \`asChild\` prop allows you to compose the Button with other elements like links.
When using \`asChild\`, you **must** provide a single child element.

**✅ Correct Usage:**
\`\`\`tsx
<Button asChild>
  <a href="/somewhere">Link Button</a>
</Button>
\`\`\`

**❌ Incorrect Usage (button disappears):**
\`\`\`tsx
<Button asChild>Click Me</Button>  // No child element!
<Button asChild>                   // Multiple children!
  <span>First</span>
  <span>Second</span>
</Button>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const WithLink: Story = {
  render: () => (
    <ThemeSection
      title="Button as Link (asChild)"
      description="The asChild prop merges button styles with a child element like an anchor tag."
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">✅ Correct: Single child element</h3>
          <div className="flex gap-4 flex-wrap">
            <Button asChild variant="default">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                External Link
              </a>
            </Button>

            <Button asChild variant="secondary">
              <a href="#section">Internal Link</a>
            </Button>

            <Button asChild variant="outline">
              <a href="/page">Outline Link</a>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">❌ Incorrect: No child element</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This will not render (button disappears):
          </p>
          <div className="flex gap-4 flex-wrap items-center">
            <code className="bg-gray-800 px-3 py-1 rounded text-xs">
              {'<Button asChild>Text</Button>'}
            </code>
            <span className="text-destructive text-sm">← This won't work!</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">✅ With Icons</h3>
          <div className="flex gap-4 flex-wrap">
            <Button asChild variant="default" size="sm">
              <a href="#" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Next Page
              </a>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">✅ Without asChild (regular button)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            For comparison, here's a regular button without asChild:
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button variant="default">Regular Button</Button>
            <Button variant="secondary">No Link Here</Button>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
};

export const WithCustomElement: Story = {
  render: () => (
    <ThemeSection
      title="Button with Custom Elements"
      description="You can use asChild with any element, not just links."
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-semibold mb-2">With span (for click handlers)</h3>
          <Button asChild variant="ghost">
            <span
              role="button"
              tabIndex={0}
              onClick={() => alert('Clicked!')}
              onKeyDown={(e) => e.key === 'Enter' && alert('Clicked!')}
            >
              Click Me (Span)
            </span>
          </Button>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2">With div (styled as button)</h3>
          <Button asChild variant="outline">
            <div role="button" tabIndex={0}>
              Custom Div Element
            </div>
          </Button>
        </div>
      </div>
    </ThemeSection>
  ),
};

export const CommonPatterns: Story = {
  render: () => (
    <ThemeSection
      title="Common Patterns"
      description="Real-world examples of using asChild."
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-semibold mb-3">Navigation Buttons</h3>
          <div className="flex gap-3">
            <Button asChild variant="default">
              <a href="/dashboard">Dashboard</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/profile">Profile</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/settings">Settings</a>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3">Download Links</h3>
          <Button asChild variant="default">
            <a href="/files/document.pdf" download>
              Download PDF
            </a>
          </Button>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3">External Resources</h3>
          <div className="flex gap-3">
            <Button asChild variant="link">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
            <Button asChild variant="link">
              <a
                href="https://docs.example.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
};
