import React from "react";
import Link from "next/link";
import { DataTable } from "@eptss/ui";
import { getDisplayName } from "@eptss/shared";

import type { Header } from "@eptss/ui";

interface CelebrationSubmission {
  username: string;
  publicDisplayName?: string | null;
  /** Active Atmosphere handle; when set it replaces the username in the table. */
  atprotoHandle?: string | null;
  soundcloudUrl?: string | null;
  audioFileUrl?: string | null;
}

interface CelebrationTablesProps {
  roundSummaryHeaders: Readonly<Header<string>[]>;
  roundSummary: Record<string, string | number | React.ReactElement>[];
  submissionsDisplayHeaders: Readonly<Header<string>[]>;
  submissions: CelebrationSubmission[];
}

export const CelebrationTables = ({ roundSummaryHeaders, roundSummary, submissionsDisplayHeaders, submissions }: CelebrationTablesProps) => (
  <>
    <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
    <div className="p-10">
      <DataTable
        title="Cover Submissions"
        headers={submissionsDisplayHeaders}
        rows={(submissions || []).map(
          ({ username, publicDisplayName, atprotoHandle, soundcloudUrl, audioFileUrl }) => {
            // Use audioFileUrl if available (new submissions), otherwise fall back to soundcloudUrl (legacy)
            const submissionUrl = audioFileUrl || soundcloudUrl;
            return {
              username: getDisplayName({ atprotoHandle, publicDisplayName, username }),
              submission: submissionUrl ? <Link href={submissionUrl}>Link</Link> : 'N/A',
            };
          }
        )}
      />
    </div>
  </>
);
