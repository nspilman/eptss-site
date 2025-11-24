import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

const alertBoxVariants = cva(
  "rounded-lg p-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        info: "bg-blue-500/10 border border-blue-500/20",
        warning: "bg-yellow-500/10 border border-yellow-500/20",
        success: "bg-green-500/10 border border-green-500/20",
        error: "bg-red-500/10 border border-red-500/20",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconVariants: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
}

const iconColorVariants: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  success: "text-green-500",
  error: "text-red-500",
}

const textColorVariants: Record<string, string> = {
  info: "text-blue-200",
  warning: "text-yellow-200",
  success: "text-green-200",
  error: "text-red-200",
}

export interface AlertBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBoxVariants> {
  title?: string
  icon?: React.ReactNode | boolean
  children: React.ReactNode
}

const AlertBox = React.forwardRef<HTMLDivElement, AlertBoxProps>(
  ({ className, variant = "info", title, icon, children, ...props }, ref) => {
    const IconComponent = variant ? iconVariants[variant] : null
    const showIcon = icon !== false
    const customIcon = icon && typeof icon !== 'boolean' ? icon : null
    const iconColor = variant ? iconColorVariants[variant] : ""

    return (
      <div
        ref={ref}
        className={cn(alertBoxVariants({ variant }), className)}
        {...props}
      >
        {showIcon && (
          <div className="shrink-0 mt-0.5">
            {customIcon || (IconComponent && <IconComponent className={cn("h-5 w-5", iconColor)} />)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm text-primary font-medium mb-1">
              {title}
            </p>
          )}
          <div className="text-sm text-secondary">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
AlertBox.displayName = "AlertBox"

export { AlertBox, alertBoxVariants }
