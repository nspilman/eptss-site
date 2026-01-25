import type { PanelProps } from "@eptss/dashboard";
import { FileText } from "lucide-react";
import { getReflectionsByRound } from "@eptss/core";
import { ReflectionsPanelClient } from "./ReflectionsPanelClient";

interface ReflectionsPanelData {
  roundId: number;
  projectSlug: string;
}

/**
 * Dashboard panel for displaying reflections
 * Shows preview of recent reflections with link to full page
 *
 * Content-only - PanelCard + DashboardLayout handle sizing/styling
 */
export async function ReflectionsPanelWrapper({ data, user }: PanelProps<ReflectionsPanelData>) {
  if (!data || !data.roundId || !data.projectSlug) {
    return null;
  }

  // If user is not logged in, show a prompt to log in
  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[var(--color-accent-primary)] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
          Round Reflections
        </h3>
        <p className="text-gray-400">
          Please log in to view reflections.
        </p>
      </div>
    );
  }

  // Fetch reflections for this round
  const reflectionsResult = await getReflectionsByRound(data.roundId, true);
  const reflections = reflectionsResult.status === 'success' ? reflectionsResult.data || [] : [];

  return (
    <ReflectionsPanelClient
      reflections={reflections}
      projectSlug={data.projectSlug}
    />
  );
}

export function ReflectionsPanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-[var(--color-gray-800)] rounded-lg"></div>
      <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
      <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
    </div>
  );
}
