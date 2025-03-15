import * as React from "react"
import { cn } from "./utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean
  }
>(({ className, gradient = false, ...props }, ref) => (
  <div className="space-y-6 relative group">
    {gradient && (
      <div className="absolute -inset-2 bg-linear-to-r from-[#40e2e2] to-[#e2e240] rounded-lg blur-sm opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700" />
    )}
    <div
      ref={ref}
      className={cn(
        "relative space-y-6 bg-black rounded-lg p-6",
        className
      )}
      {...props}
    />
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col text-center font-fraunces", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-linear-to-r from-[#e2e240] to-[#40e2e2] pb-1",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-white font-light text-sm", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-8", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
