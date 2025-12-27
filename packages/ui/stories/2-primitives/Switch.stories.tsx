import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../../src/components/ui/switch';
import { Label } from '../../src/components/ui/label';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof Switch> = {
  title: '2. Primitives/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Examples: Story = {
  render: () => {
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);
    const [autoSave, setAutoSave] = React.useState(true);

    return (
      <ThemeSection
        title="Switch Examples"
        description="Toggle switches for settings and preferences"
      >
        <div className="space-y-6 max-w-md">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <Text size="xs" className="text-[var(--color-secondary)]">
                Receive email notifications
              </Text>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Text size="xs" className="text-[var(--color-secondary)]">
                Use dark theme
              </Text>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto Save</Label>
              <Text size="xs" className="text-[var(--color-secondary)]">
                Automatically save changes
              </Text>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label htmlFor="disabled">Disabled Option</Label>
              <Text size="xs" className="text-[var(--color-secondary)]">
                This option is disabled
              </Text>
            </div>
            <Switch id="disabled" disabled />
          </div>
        </div>
      </ThemeSection>
    );
  },
};
