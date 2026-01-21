"use client";

import { motion } from "framer-motion";
import { Button } from "@eptss/ui";
import { routes } from "@eptss/routing";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
  projectSlug: string;
  listeningPartyLabel: string;
  successMessage: string;
}

export function SuccessPage({ projectSlug, listeningPartyLabel, successMessage }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle className="w-20 h-20 text-green-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-4"
      >
        Thank you for your submission!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground mb-2"
      >
        {successMessage}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground mb-8"
      >
        Please join us for the virtual listening party on <strong>{listeningPartyLabel}</strong>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4"
      >
        <Button asChild variant="outline">
          <Link href={routes.projects.dashboard(projectSlug as "cover" | "monthly-original")}>
            Go to Dashboard
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
