import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, primitiveComponent } from './utils'
import { PrimitivePropsWithoutRef } from './types'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-primary)] text-[var(--color-background-primary)] shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--color-primary)] hover:shadow-[0_0_15px_4px_rgba(var(--color-accent-primary-rgb),0.7)]',
        destructive:
          'bg-[var(--color-destructive)] text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--color-destructive-hover)] hover:shadow-[0_0_10px_2px_rgba(var(--color-destructive-rgb),0.6)]',
        outline:
          'border border-[1px] border-[var(--color-gray-700)] bg-transparent text-[var(--color-primary)] shadow-[var(--shadow-button)] transition-all duration-300 hover:border-[var(--color-accent-primary)] hover:shadow-[0_0_10px_2px_rgba(var(--color-accent-primary-rgb),0.3)]',
        secondary:
          'bg-[var(--color-accent-primary)] text-[var(--color-background-primary)] shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--color-accent-primary)] hover:shadow-[0_0_15px_4px_rgba(var(--color-primary-rgb),0.5)]',
        ghost: 'text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-bg-transparent)] hover:text-[var(--color-accent-primary)]',
        link: 'text-[var(--color-primary)] underline-offset-4 transition-all duration-300 hover:underline hover:text-[var(--color-accent-primary)]',
      },
      size: {
        // Standardized size tokens
        sm: 'h-8 rounded-sm px-3 text-xs',
        md: 'h-9 rounded-md px-4 py-2',
        lg: 'h-10 rounded-lg px-8 py-3 text-base',
        full: 'w-full h-10 rounded-md px-6 py-3',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends PrimitivePropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    // Allow className to be combined with buttonVariants styles
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default primitiveComponent(Button, 'Button')
