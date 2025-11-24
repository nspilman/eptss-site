import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        sm: "py-6 space-y-2",
        md: "py-8 space-y-4",
        lg: "py-12 space-y-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const iconVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "text-2xl mb-1",
        md: "text-4xl mb-2",
        lg: "text-6xl mb-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const titleVariants = cva(
  "font-bold text-primary",
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-lg",
        lg: "text-2xl bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const descriptionVariants = cva(
  "text-secondary",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode | string
  title?: string
  description?: string | React.ReactNode
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ size }), className)}
        {...props}
      >
        {icon && (
          <div className={cn(iconVariants({ size }))}>
            {typeof icon === 'string' ? icon : icon}
          </div>
        )}

        {title && (
          <h3 className={cn(titleVariants({ size }))}>
            {title}
          </h3>
        )}

        {description && (
          <div className={cn(descriptionVariants({ size }))}>
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>
        )}

        {children}

        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }
