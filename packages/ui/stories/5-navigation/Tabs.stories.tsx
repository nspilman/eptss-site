import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/primitives/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../src/components/ui/primitives/card';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof Tabs> = {
  title: '5. Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList className="w-full">
        <TabsTrigger value="tab1" className="flex-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" className="flex-1">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" className="flex-1">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-[var(--color-primary)]">Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-[var(--color-primary)]">Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-[var(--color-primary)]">Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

export const OutlineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList className="w-full">
        <TabsTrigger value="overview" variant="outline" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="details" variant="outline" className="flex-1">
          Details
        </TabsTrigger>
        <TabsTrigger value="settings" variant="outline" className="flex-1">
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-[var(--color-primary)]">Overview content</p>
      </TabsContent>
      <TabsContent value="details">
        <p className="text-[var(--color-primary)]">Details content</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-[var(--color-primary)]">Settings content</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-full max-w-2xl">
      <TabsList className="w-full">
        <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
        <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
        <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-primary)]">
              Account settings and preferences
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-primary)]">
              Password security settings
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-primary)]">
              Email and push notification settings
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Examples: Story = {
  render: () => (
    <ThemeSection
      title="Tabs Examples"
      description="Different tab configurations and styles"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-3 text-[var(--color-primary)]">Default Tabs</h3>
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="home" className="flex-1">Home</TabsTrigger>
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="home" padding="none">
              <p className="text-[var(--color-primary)] mt-4">Home content</p>
            </TabsContent>
            <TabsContent value="profile" padding="none">
              <p className="text-[var(--color-primary)] mt-4">Profile content</p>
            </TabsContent>
            <TabsContent value="settings" padding="none">
              <p className="text-[var(--color-primary)] mt-4">Settings content</p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-[var(--color-primary)]">Outline Tabs</h3>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="all" variant="outline" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="active" variant="outline" className="flex-1">
                Active
              </TabsTrigger>
              <TabsTrigger value="archived" variant="outline" className="flex-1">
                Archived
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" padding="none">
              <p className="text-[var(--color-primary)] mt-4">All items</p>
            </TabsContent>
            <TabsContent value="active" padding="none">
              <p className="text-[var(--color-primary)] mt-4">Active items</p>
            </TabsContent>
            <TabsContent value="archived" padding="none">
              <p className="text-[var(--color-primary)] mt-4">Archived items</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeSection>
  ),
};
