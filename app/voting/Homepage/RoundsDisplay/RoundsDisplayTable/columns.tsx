"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Rounds = {
    round: number,
    song: string,
    link: string,
}

export const columns: ColumnDef<Rounds>[] = [
    {
      accessorKey: "rounds",
      header: "Rounds",
    },
    {
      accessorKey: "song",
      header: "Cover Song",
    },
    {
      accessorKey: "link",
      header: "Link",
    },
  ]