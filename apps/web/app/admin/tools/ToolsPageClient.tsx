"use client";

import { useState } from "react";
import {
  AdminSignupForm,
  AdminSubmissionForm,
  TestEmailButtons,
  TestNotificationButton,
  TestCreateFutureRoundsButton,
  TestSendReminderEmailsButton,
  TestAdminNotificationEmailButton,
  ProjectSelector,
  type Project
} from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, AlertBox } from "@eptss/ui";

type Round = {
  roundId: number;
  slug: string;
};

type ToolsPageClientProps = {
  projects: Project[];
  initialProjectId: string;
  roundsByProject: Record<string, Round[]>;
  allUsers: any[];
};

export function ToolsPageClient({ projects, initialProjectId, roundsByProject, allUsers }: ToolsPageClientProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const rounds = roundsByProject[selectedProjectId] || [];
  const currentRound = rounds.length > 0 ? rounds[0] : null;
  const roundId = selectedRoundId || currentRound?.roundId || 0;

  // Update selected round when project changes
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedRoundId(null); // Reset round selection
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Admin Tools</h2>
        <p className="text-secondary">
          Manual operations and testing utilities
        </p>
      </div>

      <AlertBox variant="warning" title="Use with caution">
        These tools perform direct database operations and send real emails.
        Make sure you understand what each tool does before using it.
      </AlertBox>

      {/* Project and Round Selectors */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <ProjectSelector
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
              label="Project"
            />

            {rounds.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="round-select" className="block text-sm font-medium text-primary">
                  Round
                </label>
                <select
                  id="round-select"
                  value={selectedRoundId || currentRound?.roundId || ''}
                  onChange={(e) => setSelectedRoundId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background-secondary border border-background-tertiary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  {rounds.map((round) => (
                    <option key={round.roundId} value={round.roundId}>
                      {round.slug} (ID: {round.roundId})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Manual Signup</CardTitle>
            <CardDescription>
              Manually sign up a user for a round. This will send them a confirmation email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSignupForm roundId={roundId} users={allUsers} />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Manual Submission</CardTitle>
            <CardDescription>
              Submit a cover on behalf of a user. This will send them a confirmation email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSubmissionForm roundId={roundId} users={allUsers} />
          </CardContent>
        </Card>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Email Testing</CardTitle>
          <CardDescription>
            Send test emails to yourself to preview designs and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">User Action Emails</h4>
              <TestEmailButtons />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Notification Emails</h4>
              <TestAdminNotificationEmailButton />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Notification Testing</CardTitle>
          <CardDescription>
            Create a test notification to verify the notification system is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestNotificationButton />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Development Tools</CardTitle>
          <CardDescription>
            Utilities for testing and development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Create Future Rounds</h4>
              <TestCreateFutureRoundsButton />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Send Reminder Emails</h4>
              <TestSendReminderEmailsButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
