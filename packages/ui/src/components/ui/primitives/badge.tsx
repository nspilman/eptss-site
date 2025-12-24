import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn, primitiveComponent } from './utils'
import { VariantProps, cva } from 'class-variance-authority'
import { PrimitivePropsWithoutRef } from './types'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--color-primary)] text-[var(--color-background-primary)] hover:bg-[var(--color-primary)] hover:opacity-80',
        secondary:
          'border-transparent bg-[var(--color-secondary)] text-[var(--color-primary)] hover:bg-[var(--color-secondary)] hover:opacity-80',
        destructive:
          'border-transparent bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:bg-[var(--color-destructive)] hover:opacity-80',
        outline: 'text-[var(--color-foreground)]',
        count:
          'border-transparent bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] font-medium px-1.5',
        mention:
          'border-transparent bg-[var(--color-accent-primary)] text-black font-medium px-1.5 py-0.5 rounded hover:bg-[var(--color-accent-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends PrimitivePropsWithoutRef<'div'>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

const BadgeComponent = primitiveComponent(Badge, 'Badge')

export { badgeVariants, BadgeComponent as Badge }
export default BadgeComponent
