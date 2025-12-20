import * as React from "react"
import { cn } from "./utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[var(--color-border-primary)] bg-transparent px-3 py-2 text-base text-[var(--color-primary)] ring-offset-background placeholder:text-[var(--color-secondary)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        rows={rows}
        aria-multiline="true"
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
