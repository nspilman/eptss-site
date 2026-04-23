"use client";

import { useState } from "react";
import {
  AdminSignupForm,
  AdminSubmissionForm,
  TestEmailButtons,
  TestNotificationButton,
  TestActionButton,
  ProjectSelector,
  CopyEmailsButton,
  type Project
} from "@eptss/admin";
import { getActiveUserEmails } from "@eptss/core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, AlertBox } from "@eptss/ui";
import { Bell, Calendar, Mail, Music } from "lucide-react";

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

      {/* Active User Emails */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Active User Mailing List</CardTitle>
          <CardDescription>
            Copy emails of active users (signed up in last 3 months, submitted a cover, or updated display name)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyEmailsButton
            source={getActiveUserEmails}
            label="Copy Active User Emails"
            variant="default"
            size="md"
          />
        </CardContent>
      </Card>

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
              <TestActionButton
                endpoint="/api/admin/test-notification-email"
                icon={<Mail className="mr-2" />}
                title="Test My Notification Email"
                description="Send a test notification email to your admin account. This will use your actual unread notifications."
                buttonLabel="Send Test Email to Me"
                loadingLabel="Sending..."
                useCronAuth={false}
                getResult={(data) =>
                  data.success
                    ? { type: "success", text: data.message }
                    : { type: "info", text: data.message || "No notification emails to send" }
                }
                renderDetails={(data) => (
                  <div className="space-y-1 text-secondary">
                    {data.recipientEmail && (
                      <div><strong>Sent to:</strong> {data.recipientEmail}</div>
                    )}
                    {data.unreadCount !== undefined && (
                      <div><strong>Unread notifications:</strong> {data.unreadCount}</div>
                    )}
                    {data.emailType && (
                      <div><strong>Email type:</strong> {data.emailType}</div>
                    )}
                    {data.error && (
                      <div className="mt-2">
                        <strong>Error details:</strong>
                        <pre className="mt-1">{JSON.stringify(data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              />
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
              <TestActionButton
                endpoint="/api/cron/create-future-rounds"
                icon={<Calendar className="mr-2" />}
                title="Test Create Future Rounds"
                description="Test the cron job that automatically creates 2 future quarterly rounds."
                buttonLabel="Test Create Future Rounds"
                getResult={(data) =>
                  data.action === "created"
                    ? {
                        type: "success",
                        text: `Created ${data.createdRounds.length} future round(s): ${data.createdRounds.map((r: any) => r.slug).join(", ")}`,
                      }
                    : {
                        type: "info",
                        text: data.message || "No action taken (expected if 2 future rounds already exist)",
                      }
                }
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Send Reminder Emails</h4>
              <TestActionButton
                endpoint="/api/cron/send-reminder-emails"
                icon={<Mail className="mr-2" />}
                title="Test Send Reminder Emails"
                description="Test the cron job that sends reminder emails throughout the round."
                buttonLabel="Test Send Reminder Emails"
                getResult={(data) => {
                  if (data.action === "sent") {
                    const totalSent =
                      data.results?.sent?.reduce(
                        (sum: number, r: any) => sum + r.recipientCount,
                        0
                      ) || 0;
                    return { type: "success", text: `Sent ${totalSent} reminder email(s)` };
                  }
                  return { type: "info", text: data.message || "No reminders triggered for today" };
                }}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Assign Round Song</h4>
              <TestActionButton
                endpoint="/api/cron/assign-round-song"
                icon={<Music className="mr-2" />}
                title="Test Auto-Assign Round Song"
                description="Test the cron job that automatically assigns the winning song when voting closes."
                buttonLabel="Test Assign Round Song"
                getResult={(data) =>
                  data.action === "assigned"
                    ? {
                        type: "success",
                        text: `Song assigned: ${data.assignedSong.title} - ${data.assignedSong.artist}`,
                      }
                    : {
                        type: "info",
                        text: data.message || "No action taken (expected if not in covering phase or song already assigned)",
                      }
                }
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Send Notification Emails</h4>
              <TestActionButton
                endpoint="/api/cron/send-notification-emails"
                icon={<Bell className="mr-2" />}
                title="Test Notification Emails"
                description="Test the cron job that sends notification emails to users with unread notifications."
                buttonLabel="Test Notification Emails"
                getResult={(data) =>
                  data.emailsSent > 0
                    ? {
                        type: "success",
                        text: `Successfully sent ${data.emailsSent} notification email(s)`,
                      }
                    : {
                        type: "info",
                        text: data.message || "No notification emails needed to be sent",
                      }
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
