import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const gradientDividerVariants = cva(
  "bg-gradient-to-r from-transparent via-gray-700 to-transparent",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "w-px h-full",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface GradientDividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientDividerVariants> {}

const GradientDivider = React.forwardRef<HTMLDivElement, GradientDividerProps>(
  ({ className, orientation, ...props }, ref) => {
    // Adjust gradient direction based on orientation
    const gradientClass = orientation === "vertical"
      ? "bg-gradient-to-b from-transparent via-gray-700 to-transparent"
      : "bg-gradient-to-r from-transparent via-gray-700 to-transparent"

    return (
      <div
        ref={ref}
        className={cn(
          orientation === "vertical" ? "w-px h-full" : "h-px w-full",
          gradientClass,
          className
        )}
        {...props}
      />
    )
  }
)
GradientDivider.displayName = "GradientDivider"

export { GradientDivider, gradientDividerVariants }
