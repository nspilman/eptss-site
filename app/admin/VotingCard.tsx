"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives"
import { ChartBar } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import Link from "next/link"

type VoteOption = {
  song: {
    title: string;
    artist: string;
  };
  youtubeLink?: string;
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
  const voteOptionsArray = voteOptions.map((option) => ({
    song: `${option.song.title} - ${option.song.artist}`,
    link: option.youtubeLink ? (
      <Link href={option.youtubeLink} className="text-blue-400 hover:text-blue-300" target="_blank">
        Watch
      </Link>
    ) : "N/A",
  }));

  const voteOptionHeaders = [
    { key: "song", label: "Song", sortable: true },
    { key: "link", label: "YouTube Link", sortable: true },
  ];

  const voteResultsHeaders = [
    { key: "title", label: "Title", sortable: true },
    { key: "artist", label: "Artist", sortable: true },
    { key: "average", label: "Average Score", sortable: true },
    { key: "votesCount", label: "Total Votes", sortable: true },
  ];

  const outstandingVotesHeader = [{ key: "email", label: "Email" }];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <ChartBar className="mr-2" />
              Voting Results
            </CardTitle>
            <span className="text-sm text-gray-400">
              {outstandingVoters.length} pending
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] space-y-4 overflow-auto pr-2">
            <div>
              <h3 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                Vote Options
              </h3>
              <div className="rounded-lg border border-gray-700/50">
                <DataTable rows={voteOptionsArray} headers={voteOptionHeaders} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Vote Results</h3>
              <div className="rounded-lg border border-gray-700/50">
                <DataTable rows={voteResults} headers={voteResultsHeaders} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Outstanding Voters</h3>
              <div className="rounded-lg border border-gray-700/50">
                <DataTable
                  rows={outstandingVoters.map((email) => ({ email }))}
                  headers={outstandingVotesHeader}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};