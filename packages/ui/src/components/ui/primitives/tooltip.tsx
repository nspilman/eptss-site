import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "./utils"

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 5, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "bg-[var(--color-gray-900)] text-[var(--color-white)] text-sm rounded-xl py-3 px-4 shadow-2xl z-50",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Simplified Tooltip wrapper for common use cases
export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  className?: string
  contentClassName?: string
}

const Tooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  className,
  contentClassName,
}: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export {
  Tooltip,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
}
