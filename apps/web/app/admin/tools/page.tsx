import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getCurrentRound, getAllUsers } from "@eptss/data-access";
import {
  AdminSignupForm,
  AdminSubmissionForm,
  TestEmailButtons,
  TestNotificationButton,
  TestAssignRoundSongButton,
  TestCreateFutureRoundsButton,
  TestSendReminderEmailsButton
} from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, AlertBox } from "@eptss/ui";

export const metadata: Metadata = {
  title: "Admin Tools | Admin",
  description: "Admin utilities and tools",
};

async function ToolsContent() {
  const [currentRoundResult, allUsers] = await Promise.all([
    getCurrentRound(),
    getAllUsers(),
  ]);

  const currentRound = currentRoundResult.status === 'success' ? currentRoundResult.data : null;
  const roundId = currentRound?.roundId || 0;

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
          <TestEmailButtons />
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
              <h4 className="text-sm font-medium text-primary mb-2">Assign Round Song</h4>
              <TestAssignRoundSongButton />
            </div>
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

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-background-secondary/30 animate-pulse rounded" />}>
      <ToolsContent />
    </Suspense>
  );
}
