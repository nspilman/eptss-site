"use client";

import { motion } from "framer-motion";
import { ProjectStatsCard } from "../ProjectStatsCard";

type OverviewTabProps = {
  stats: {
    totalUsers: number;
    totalRounds: number;
    activeUsers: number;
    completionRate: number;
  };
};

export function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Project Overview Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Project Overview</h2>
        <ProjectStatsCard 
          totalUsers={stats.totalUsers}
          totalRounds={stats.totalRounds}
          activeUsers={stats.activeUsers}
          completionRate={stats.completionRate}
        />
      </section>
    </motion.div>
  );
}
