"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./utils"
import Link from "next/link"

interface RoundCardProps extends HTMLMotionProps<"div"> {
  href: string
  isActive?: boolean
  children: React.ReactNode
}

const RoundCard = React.forwardRef<HTMLDivElement, RoundCardProps>(
  ({ className, href, isActive, children, ...props }, ref) => {
    return (
      <Link href={href}>
        <motion.div
          ref={ref}
          className={cn(
            "bg-[var(--color-gray-800)]/50 backdrop-blur-md rounded-lg p-4 border",
            isActive
              ? "border-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)]"
              : "border-[var(--color-gray-700)]",
            "hover:bg-opacity-70 transition-all group",
            className
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          {...props}
        >
          {children}
        </motion.div>
      </Link>
    )
  }
)
RoundCard.displayName = "RoundCard"

export { RoundCard }
export type { RoundCardProps }
