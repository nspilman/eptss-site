"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, DataTable } from "@eptss/ui"
import type { ReactNode } from "react"

export interface DataTableCardProps {
  /** Card title */
  title: string
  /** Icon to display next to title */
  icon: ReactNode
  /** Total count to display in header (e.g., "5 total") */
  count?: number
  /** Custom count label (defaults to "total") */
  countLabel?: string
  /** Data rows for the table */
  rows: any[]
  /** Table header configuration */
  headers: Array<{ key: string; label: string; sortable?: boolean }>
  /** Maximum height for table scroll area */
  maxHeight?: number
  /** Enable copy functionality in table */
  allowCopy?: boolean
  /** Animation delay in seconds */
  delay?: number
  /** Animation direction */
  animationDirection?: 'left' | 'right' | 'up' | 'scale'
  /** Custom className for the card */
  className?: string
  /** Disable animation */
  disableAnimation?: boolean
}

const ANIMATION_VARIANTS = {
  left: { x: -20, opacity: 0 },
  right: { x: 20, opacity: 0 },
  up: { y: 20, opacity: 0 },
  scale: { scale: 0.95, opacity: 0 }
}

/**
 * DataTableCard - A consistent card component for displaying data tables
 * with an icon, title, count, and optional animations.
 *
 * This component consolidates the common pattern used across SignupsCard,
 * SubmissionsCard, FeedbackCard, and RoundScheduleCard.
 *
 * @example
 * ```tsx
 * <DataTableCard
 *   title="Signups"
 *   icon={<Users />}
 *   count={signups.length}
 *   rows={signupRows}
 *   headers={signupHeaders}
 *   animationDirection="right"
 *   delay={0.3}
 * />
 * ```
 */
export const DataTableCard = ({
  title,
  icon,
  count,
  countLabel = "total",
  rows,
  headers,
  maxHeight = 400,
  allowCopy = true,
  delay = 0,
  animationDirection = 'right',
  className = '',
  disableAnimation = false
}: DataTableCardProps) => {
  const content = (
    <Card className={`bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors h-full w-full max-w-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
          {count !== undefined && (
            <span className="text-sm text-gray-400">
              {count} {countLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="rounded-lg border border-gray-700/50 w-full">
          <DataTable
            rows={rows}
            headers={headers}
            maxHeight={maxHeight}
            allowCopy={allowCopy}
          />
        </div>
      </CardContent>
    </Card>
  )

  if (disableAnimation) {
    return content
  }

  return (
    <motion.div
      initial={ANIMATION_VARIANTS[animationDirection]}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="w-full max-w-full"
    >
      {content}
    </motion.div>
  )
}
