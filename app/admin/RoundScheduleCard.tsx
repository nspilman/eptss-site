"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import { Phase } from "@/types/round"
import { formatDate } from "@/services/dateService"

type DateLabel = {
  opens: string;
  closes: string;
}

type RoundScheduleProps = {
  phase: Phase;
  dateLabels: Record<Phase, DateLabel>;
}

export const RoundScheduleCard = ({ phase, dateLabels }: RoundScheduleProps) => {
  const dateHeaders = [
    { key: 'phase', label: 'Phase', sortable: true },
    { key: 'opens', label: 'Opens', sortable: true },
    { key: 'closes', label: 'Closes', sortable: true },
  ]


  const dates = Object.entries(dateLabels).map(([phase, { opens, closes }]) => ({
    phase,
    opens: formatDate.compact(opens),
    closes: formatDate.compact(closes),
  }))

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors">
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white text-lg">
              <CalendarDays className="mr-2 h-5 w-5" />
              Round Schedule
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-white border border-primary/20">
              Current Phase: {phase}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="rounded-lg border border-gray-700/50">
            <DataTable rows={dates} headers={dateHeaders} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}