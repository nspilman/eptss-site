"use client"

import { Users } from "lucide-react"
import { DataTableCard } from "./DataTableCard"
import { CopyEmailsButton } from "./CopyEmailsButton"

type SignupData = {
  email?: string | null;
  song: {
    title: string;
    artist: string;
  };
  songId: number | null;
  youtubeLink: string | null;
  userId?: string;
}

type SignupsCardProps = {
  signups: SignupData[]
}

export const SignupsCard = ({ signups }: SignupsCardProps) => {
  const headers = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'song', label: 'Song', sortable: true },
    { key: 'youtubeLink', label: 'YouTube Link', sortable: true },
  ]

  const rows = signups.map(signup => ({
    email: signup.email || 'Unknown',
    song: `${signup.song.title} - ${signup.song.artist}`,
    youtubeLink: signup.youtubeLink || 'Not provided',
  }))

  return (
    <DataTableCard
      title="Signups"
      icon={<Users className="mr-2" />}
      count={signups.length}
      headerAction={
        <CopyEmailsButton
          source={signups.map((s) => s.email).filter((e): e is string => !!e)}
        />
      }
      rows={rows}
      headers={headers}
      delay={0.3}
    />
  )
}
