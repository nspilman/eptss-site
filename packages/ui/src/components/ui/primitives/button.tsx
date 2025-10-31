import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, primitiveComponent } from './utils'
import { PrimitivePropsWithoutRef } from './types'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'shadow-sm hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.4)]',
        destructive: 'shadow-sm hover:shadow-[0_0_20px_3px_rgba(239,68,68,0.5)]',
        outline: 'border bg-transparent shadow-sm hover:shadow-[0_0_15px_2px_rgba(226,226,64,0.3)]',
        secondary: 'shadow-sm hover:shadow-[0_0_20px_4px_rgba(226,226,64,0.6)]',
        ghost: 'hover:shadow-[0_0_10px_1px_rgba(255,255,255,0.1)]',
        link: 'underline-offset-4',
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

// Define variant styles that use CSS variables
const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-background-primary)',
  },
  destructive: {
    backgroundColor: 'var(--color-destructive)',
    color: 'white',
  },
  outline: {
    borderColor: 'var(--color-gray-700)',
    color: 'var(--color-primary)',
  },
  secondary: {
    backgroundColor: 'var(--color-accent-primary)',
    color: 'var(--color-background-primary)',
  },
  ghost: {
    color: 'var(--color-primary)',
  },
  link: {
    color: 'var(--color-primary)',
  },
}

export interface ButtonProps
  extends PrimitivePropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    // Combine inline styles with variant-specific CSS variable styles
    const combinedStyle = {
      ...(variant ? variantStyles[variant] : {}),
      ...style,
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        style={combinedStyle}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default primitiveComponent(Button, 'Button')
