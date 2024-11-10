"use client"
// components/VotingCard.tsx
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartBar } from "lucide-react"
import { DataTable } from "@/components/DataTable"

type VoteOption = {
  label: string
  link: string
}

type VoteResult = {
  title: string
  artist: string
  average: number
  votesCount: number
}

type VotingCardProps = {
  voteOptions: VoteOption[]
  outstandingVoters: string[]
  voteResults: VoteResult[]
}

export const VotingCard = ({ voteOptions, outstandingVoters, voteResults }: VotingCardProps) => {
  const voteOptionHeaders = [
    { key: 'label', display: 'Label', sortable: true },
    { key: 'link', display: 'Link', sortable: true },
  ]

  const outstandingVotesHeader = [
    { key: "email", display: "Email", sortable: true }
  ]

  const voteHeaders = [
    { key: "title", display: "Title", sortable: true },
    { key: "artist", display: "Artist", sortable: true },
    { key: "average", display: "Average", sortable: true },
    { key: "votesCount", display: "Votes Count", sortable: true },
  ]

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-[#e2e240]">
            <ChartBar className="mr-2" />
            Voting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl mb-4">Vote Options</h3>
          <DataTable rows={voteOptions} headers={voteOptionHeaders} />
          <h3 className="text-xl mt-6 mb-4">Outstanding Voters</h3>
          <DataTable rows={outstandingVoters.map(email => ({email}))} headers={outstandingVotesHeader} />
          <h3 className="text-xl mt-6 mb-4">Vote Results</h3>
          <DataTable rows={voteResults} headers={voteHeaders} />
        </CardContent>
      </Card>
    </motion.div>
  )
}