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
import { AlertTriangle } from "lucide-react";

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

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-primary font-medium mb-1">Use with caution</p>
          <p className="text-sm text-secondary">
            These tools perform direct database operations and send real emails. 
            Make sure you understand what each tool does before using it.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Manual Signup</h3>
          <p className="text-sm text-secondary mb-4">
            Manually sign up a user for a round. This will send them a confirmation email.
          </p>
          <AdminSignupForm roundId={roundId} users={allUsers} />
        </div>

        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Manual Submission</h3>
          <p className="text-sm text-secondary mb-4">
            Submit a cover on behalf of a user. This will send them a confirmation email.
          </p>
          <AdminSubmissionForm roundId={roundId} users={allUsers} />
        </div>
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Email Testing</h3>
        <p className="text-sm text-secondary mb-4">
          Send test emails to yourself to preview designs and content
        </p>
        <TestEmailButtons />
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Notification Testing</h3>
        <p className="text-sm text-secondary mb-4">
          Create a test notification to verify the notification system is working
        </p>
        <TestNotificationButton />
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Development Tools</h3>
        <p className="text-sm text-secondary mb-4">
          Utilities for testing and development
        </p>
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
      </div>
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
