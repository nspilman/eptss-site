"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui"
import { Users } from "lucide-react"
import { DataTable } from "@eptss/ui"

type SignupData = {
  email?: string | null;
  song: {
    title: string;
    artist: string;
  };
  songId: number;
  youtubeLink: string;
  userId?: string;
}

type SignupsCardProps = {
  signups: SignupData[]
}

export const SignupsCard = ({ signups }: SignupsCardProps) => {
  const signupHeaders = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'song', label: 'Song', sortable: true },
    { key: 'youtubeLink', label: 'YouTube Link', sortable: true },
  ]

  const signupRows = signups.map(signup => ({
    email: signup.email || 'Unknown',
    song: `${signup.song.title} - ${signup.song.artist}`,
    youtubeLink: signup.youtubeLink,
  }))

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Users className="mr-2" />
              Signups
            </CardTitle>
            <span className="text-sm text-gray-400">
              {signups.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-700/50">
            <DataTable rows={signupRows} headers={signupHeaders} maxHeight={400} allowCopy={true} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}