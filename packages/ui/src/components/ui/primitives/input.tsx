import * as React from "react"
import { cn, primitiveComponent } from "./utils"
import { PrimitivePropsWithoutRef } from "./types"

export interface InputProps extends PrimitivePropsWithoutRef<"input"> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--color-border-primary)] bg-transparent px-3 py-2 text-base text-[var(--color-primary)] shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-secondary)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[var(--color-destructive)] focus-visible:ring-[var(--color-destructive)]",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export default primitiveComponent(Input, "Input")
