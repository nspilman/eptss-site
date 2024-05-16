"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Rounds = {
    title: string;
    artist: string;
    roundId: number;
    playlistUrl: string;
}

export const columns: ColumnDef<Rounds>[] = [
    
    {
        accessorKey: "roundId",
        header: () => <div className="font-extrabold">Round</div>
    },
    {
      accessorKey: "artist",
      header: "Cover Artist",
      cell() {
        
          
      },
    },
    {
      accessorKey: "title",
      header: "Cover Title",
    },
    // {
    //   accessorKey: "playlistUrl",
    //   header: "Listen",
    // },
  ]