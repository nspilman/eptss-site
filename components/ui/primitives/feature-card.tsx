"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./utils"

interface FeatureCardProps extends HTMLMotionProps<"div"> {
  icon: string
  title: string
  description: string
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, title, description, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex items-start space-x-4 p-4 rounded-lg bg-[var(--color-gray-800)]/30 border border-[var(--color-gray-700)]/50 backdrop-blur-xs",
          className
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-gray-200)] mb-2">{title}</h3>
          <p className="text-[var(--color-gray-300)]">{description}</p>
        </div>
      </motion.div>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export { FeatureCard }
export type { FeatureCardProps }
