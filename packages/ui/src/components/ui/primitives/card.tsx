import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const cardVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-background-secondary)] border border-[var(--color-gray-800)] shadow-lg rounded-lg overflow-hidden",
        glass: "bg-[var(--color-background-secondary)]/50 backdrop-blur-sm border border-[var(--color-background-tertiary)]/50 rounded-lg overflow-hidden",
        plain: "bg-[var(--color-background-secondary)] shadow-sm rounded-lg overflow-hidden",
        "gradient-border": "bg-[var(--color-background-primary)] shadow-lg rounded-lg overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  gradient?: boolean
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, gradient = false, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    const isGradientBorder = variant === "gradient-border"

    return (
      <div className={cn("relative group", isGradientBorder && "p-[2px] rounded-lg")} style={isGradientBorder ? { background: 'var(--color-gradient-primary)', boxShadow: '0 0 20px rgba(64, 226, 226, 0.3), 0 0 40px rgba(226, 226, 64, 0.2)' } : undefined}>
        {gradient && !isGradientBorder && (
          <div
            className="absolute -inset-2 rounded-lg blur-sm opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"
            style={{ background: 'var(--color-gradient-primary)' }}
          />
        )}
        <Comp
          ref={ref}
          className={cn(cardVariants({ variant }), className)}
          {...props}
        />
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 px-6 py-4 font-fraunces", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl text-[var(--color-white)] font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-gray-400)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-6 py-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
