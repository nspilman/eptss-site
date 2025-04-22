import * as React from "react"
import { cn } from "./utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[var(--color-border-primary)] bg-transparent px-3 py-2 text-sm text-[var(--color-primary)] ring-offset-background placeholder:text-[var(--color-secondary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        aria-multiline="true"
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
