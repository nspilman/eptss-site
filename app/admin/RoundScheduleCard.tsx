"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { DataTable } from "@/components/DataTable"

type DateEntry = {
  phase: string
  opens: string
  closes: string
}

type RoundScheduleProps = {
  phase: string
  dates: DateEntry[]
}

export const RoundScheduleCard = ({ phase, dates }: RoundScheduleProps) => {
  const dateHeaders = [
    { key: 'phase', display: 'Phase', sortable: true },
    { key: 'opens', display: 'Opens', sortable: true },
    { key: 'closes', display: 'Closes', sortable: true },
  ]

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-[#e2e240]">
            <CalendarDays className="mr-2" />
            Round Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="mb-4 bg-[#40e2e2] text-[#0a0a1e]">
            Current Phase: {phase}
          </Badge>
          <DataTable rows={dates} headers={dateHeaders} />
        </CardContent>
      </Card>
    </motion.div>
  )
}