"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui"
import { Music } from "lucide-react"
import { DataTable } from "@eptss/ui"
import Link from "next/link"
import type { Submission } from "@eptss/core/types/round"

type SubmissionsCardProps = {
  submissions: Submission[]
}

export const SubmissionsCard = ({ submissions }: SubmissionsCardProps) => {
  const submissionHeaders = [
    { key: 'username', label: 'Username', sortable: true },
    { key: 'submission', label: 'Submission', sortable: true },
    { key: 'createdAt', label: 'Submission Date', sortable: true },
  ]

  const submissionRows = submissions.map(submission => {
    // Use audioFileUrl if available (new submissions), otherwise fall back to soundcloudUrl (legacy)
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
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Music className="mr-2" />
              Submissions
            </CardTitle>
            <span className="text-sm text-gray-400">
              {submissions.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-700/50">
            <DataTable rows={submissionRows} headers={submissionHeaders} maxHeight={400} allowCopy={true} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
