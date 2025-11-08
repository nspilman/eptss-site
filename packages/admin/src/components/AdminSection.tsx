"use client"

import type { ReactNode } from "react"

export interface AdminSectionProps {
  /** Section title */
  title?: string
  /** Optional description text */
  description?: string
  /** Section content */
  children: ReactNode
  /** Variant style */
  variant?: 'default' | 'compact'
  /** Custom className */
  className?: string
  /** Title size */
  titleSize?: 'sm' | 'md' | 'lg' | 'xl'
}

const TITLE_SIZES = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
}

/**
 * AdminSection - A consistent wrapper component for admin page sections
 *
 * Provides the common pattern of a section with background, border, padding,
 * and optional title/description that appears throughout the admin interface.
 *
 * @example
 * ```tsx
 * <AdminSection
 *   title="Round Schedule"
 *   description="View all phase dates"
 * >
 *   <DataTable rows={dates} headers={headers} />
 * </AdminSection>
 * ```
 */
export const AdminSection = ({
  title,
  description,
  children,
  variant = 'default',
  className = '',
  titleSize = 'xl'
}: AdminSectionProps) => {
  const padding = variant === 'compact' ? 'p-4' : 'p-6'
  const titleMargin = description ? 'mb-2' : 'mb-4'

  return (
    <div className={`bg-background-secondary/50 border border-background-tertiary/50 rounded-lg ${padding} w-full max-w-full overflow-x-auto ${className}`}>
      {title && (
        <h3 className={`${TITLE_SIZES[titleSize]} font-semibold text-primary ${titleMargin}`}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-secondary mb-4">{description}</p>
      )}
      {children}
    </div>
  )
}
