"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import { DataTable } from "@/components/DataTable"

type Submission = {
     roundId: number; soundcloudUrl: string; artist: string; created_at: string; round_id: number; soundcloud_url: string; title: string; username: string;
}

type SubmissionsCardProps = {
  submissions: Submission[]
}

export const SubmissionsCard = ({ submissions }: SubmissionsCardProps) => {
  const submissionHeaders = [
    { key: 'username', display: 'Username', sortable: true },
    { key: 'title', display: 'Title', sortable: true },
    { key: 'artist', display: 'Artist', sortable: true },
    { key: 'created_at', display: 'Submission Date', sortable: true },
  ]

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-[#e2e240]">
            <Music className="mr-2" />
            Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xl">Total Submissions: {submissions.length}</p>
          <DataTable rows={submissions} headers={submissionHeaders} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
