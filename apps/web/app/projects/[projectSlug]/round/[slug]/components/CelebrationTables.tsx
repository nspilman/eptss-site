import React from "react";
import Link from "next/link";
import { DataTable } from "@eptss/ui";

import type { Header } from "@eptss/ui";

interface CelebrationTablesProps {
  roundSummaryHeaders: Readonly<Header<string>[]>;
  roundSummary: Record<string, string | number | React.ReactElement>[];
  submissionsDisplayHeaders: Readonly<Header<string>[]>;
  submissions: { username: string; soundcloudUrl: string }[];
}

export const CelebrationTables = ({ roundSummaryHeaders, roundSummary, submissionsDisplayHeaders, submissions }: CelebrationTablesProps) => (
  <>
    <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
    <div className="p-10">
      <DataTable
        title="Cover Submissions"
        headers={submissionsDisplayHeaders}
        rows={(submissions || []).map(
          ({ username, soundcloudUrl }: any) => ({
            username,
            soundcloudUrl: <Link href={soundcloudUrl}>Link</Link>,
          })
        )}
      />
    </div>
  </>
);
