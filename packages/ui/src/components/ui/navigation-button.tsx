import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from './primitives'

const navigationButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      intent: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'hover:bg-accent hover:text-accent-primary',
        main: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
      },
    },
    defaultVariants: {
      intent: 'default',
      size: 'default',
    },
  }
)

type NavigationButtonVariantProps = VariantProps<typeof navigationButtonVariants>

export interface NavigationButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'size' | 'variant'> {
  href: string
  intent?: NavigationButtonVariantProps['intent']
  size?: NavigationButtonVariantProps['size']
}

export const NavigationButton = React.forwardRef<
  HTMLButtonElement,
  NavigationButtonProps
>(({ className, intent, size, href, children, ...props }, ref) => {
  return (
    <Button
      asChild
      className={navigationButtonVariants({ intent, size, className })}
      ref={ref}
      {...props}
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
})

NavigationButton.displayName = 'NavigationButton'
