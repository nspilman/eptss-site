"use client";

import { motion } from "framer-motion";
import { ActiveUsersCard } from "../ActiveUsersCard";
import { ActiveUserDetail } from "@eptss/core";

type UsersTabProps = {
  activeUsers: ActiveUserDetail[];
};

export function UsersTab({ activeUsers }: UsersTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* User Activity Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">User Activity</h2>
        <ActiveUsersCard users={activeUsers} />
      </section>
    </motion.div>
  );
}
