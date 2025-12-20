import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const sectionHeaderVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "",
        "accent-border": "border-l-2 pl-4",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
      align: {
        left: "text-left",
        center: "text-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      align: "left",
    },
  }
)

const titleVariants = cva(
  "font-fraunces text-primary tracking-tight",
  {
    variants: {
      size: {
        sm: "text-lg font-semibold",
        md: "text-2xl md:text-3xl font-bold",
        lg: "text-3xl md:text-4xl font-bold",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const subtitleVariants = cva(
  "text-secondary",
  {
    variants: {
      size: {
        sm: "text-xs mt-1",
        md: "text-sm mt-1",
        lg: "text-lg md:text-xl mt-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const borderColorVariants: Record<string, string> = {
  primary: "border-accent-primary",
  secondary: "border-accent-secondary",
}

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title: string
  subtitle?: string
  borderColor?: "primary" | "secondary"
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, variant, size, align, title, subtitle, borderColor = "primary", ...props }, ref) => {
    const borderColorClass = variant === "accent-border" ? borderColorVariants[borderColor] : ""

    return (
      <div
        ref={ref}
        className={cn(
          sectionHeaderVariants({ variant, size, align }),
          borderColorClass,
          className
        )}
        {...props}
      >
        <h2 className={cn(titleVariants({ size }))}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(subtitleVariants({ size }))}>
            {subtitle}
          </p>
        )}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader, sectionHeaderVariants }
