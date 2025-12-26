import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn, primitiveComponent } from './utils'
import { VariantProps, cva } from 'class-variance-authority'
import { PrimitivePropsWithoutRef } from './types'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--color-accent-primary)] text-[var(--color-background-primary)] hover:bg-[var(--color-accent-secondary)]',
        secondary:
          'border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] backdrop-blur-sm hover:bg-[var(--color-accent-primary)]/20',
        destructive:
          'border-transparent bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive)] hover:opacity-80',
        outline: 'border-[var(--color-accent-primary)]/40 bg-transparent text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10',
        count:
          'border-transparent bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] font-medium px-2',
        mention:
          'border-transparent bg-[var(--color-accent-primary)] text-black font-medium px-2 py-1 rounded hover:bg-[var(--color-accent-secondary)]',
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
