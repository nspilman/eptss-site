"use client";

import { motion } from "framer-motion";
import { AdminSignupForm } from "./AdminSignupForm";
import { AdminSubmissionForm } from "./AdminSubmissionForm";
import { CreateRoundForm } from "./CreateRoundForm";
import { UpdateRoundForm } from "./UpdateRoundForm";
import { SetRoundSongForm } from "./SetRoundSongForm";
import { TestEmailButtons } from "./TestEmailButton";
import { TestAssignRoundSongButton } from "./TestAssignRoundSongButton";
import { TestCreateFutureRoundsButton } from "./TestCreateFutureRoundsButton";
import { TestSendReminderEmailsButton } from "./TestSendReminderEmailsButton";
import { TestNotificationEmailsButton } from "./TestNotificationEmailsButton";
import { TestAdminNotificationEmailButton } from "./TestAdminNotificationEmailButton";
import { UserDetails } from "@eptss/data-access/types/user";
import { COVER_PROJECT_ID } from "@eptss/data-access";

type ActionsTabProps = {
  roundId: number;
  users: UserDetails[];
  roundSlug: string;
  allRoundSlugs: string[];
};

export function ActionsTab({ roundId, users, roundSlug, allRoundSlugs }: ActionsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Email Testing Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary mb-4">Email Testing</h2>
        <div>
          <p className="text-sm text-gray-400 mb-3">
            Send test emails to yourself to preview the design and content for each user action.
          </p>
          <TestEmailButtons />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-3">
            Test notification emails using your actual unread notifications.
          </p>
          <TestAdminNotificationEmailButton />
        </div>
      </section>

      {/* Admin Tools Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <AdminSignupForm roundId={roundId} users={users} />
          </div>
          <div>
            <AdminSubmissionForm roundId={roundId} users={users} />
          </div>
        </div>
      </section>

      {/* Round Management Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary mb-4">Round Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CreateRoundForm projectId={COVER_PROJECT_ID} />
          </div>
          <div>
            <UpdateRoundForm projectId={COVER_PROJECT_ID} allRoundSlugs={allRoundSlugs} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SetRoundSongForm roundId={roundId} roundSlug={roundSlug} />
          </div>
        </div>
      </section>

      {/* Automation Testing Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-primary mb-4">Automation Testing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <TestAssignRoundSongButton />
          </div>
          <div>
            <TestCreateFutureRoundsButton />
          </div>
          <div>
            <TestSendReminderEmailsButton />
          </div>
          <div>
            <TestNotificationEmailsButton />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
