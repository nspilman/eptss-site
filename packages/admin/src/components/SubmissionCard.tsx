"use client"

import { Music } from "lucide-react"
import Link from "next/link"
import type { Submission } from "@eptss/core/types/round"
import { DataTableCard } from "./DataTableCard"

type SubmissionsCardProps = {
  submissions: Submission[]
}

export const SubmissionsCard = ({ submissions }: SubmissionsCardProps) => {
  const headers = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'submission', label: 'Submission', sortable: true },
    { key: 'createdAt', label: 'Submission Date', sortable: true },
  ]

  const rows = submissions.map(submission => {
    const submissionUrl = submission.audioFileUrl || submission.soundcloudUrl;
    return {
      username: submission.username,
      submission: submissionUrl ? (
        <Link href={submissionUrl} className="text-blue-400 hover:text-blue-300" target="_blank">Listen</Link>
      ) : 'N/A',
      createdAt: submission.createdAt.toLocaleString(),
    };
  })

  return (
    <DataTableCard
      title="Submissions"
      icon={<Music className="mr-2" />}
      count={submissions.length}
      rows={rows}
      headers={headers}
      delay={0.4}
      animationDirection="left"
    />
  )
}
