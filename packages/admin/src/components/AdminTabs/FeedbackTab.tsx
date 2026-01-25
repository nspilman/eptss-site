"use client";

import { motion } from "framer-motion";
import { FeedbackCard } from "../FeedbackCard";
import type { Feedback } from "@eptss/core";

type FeedbackTabProps = {
  feedbackList: Feedback[];
};

export function FeedbackTab({ feedbackList }: FeedbackTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Feedback Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">User Feedback</h2>
        <p className="text-gray-400 mb-6">
          View and manage user feedback submissions. Toggle visibility to make feedback public or private, or delete inappropriate entries.
        </p>
        <FeedbackCard feedbackList={feedbackList} />
      </section>
    </motion.div>
  );
}
