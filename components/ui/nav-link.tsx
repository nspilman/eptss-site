import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './primitives/utils'

const navLinkVariants = cva(
  'flex items-center gap-2 px-3 py-2 text-gray-300 transition-colors rounded-md hover:text-theme-yellow hover:bg-gray-800/50',
  {
    variants: {
      variant: {
        default: '',
        glowing: 'hover:shadow-nav-shadow',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface NavLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link>,
    VariantProps<typeof navLinkVariants> {
  label: string;
  icon?: React.ReactNode;
}

export const NavLink = React.forwardRef<
  HTMLAnchorElement,
  NavLinkProps
>(({ className, variant, href, label, icon, onClick, ...props }, ref) => {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      ref={ref}
      {...props}
    >
      <div className={cn(navLinkVariants({ variant, className }))}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  )
})

NavLink.displayName = 'NavLink'
