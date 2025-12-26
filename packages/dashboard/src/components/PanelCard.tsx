import { ReactNode } from 'react';

export type PanelCardVariant = 'hero' | 'card' | 'flat' | 'sidebar' | 'dark' | 'none';

interface PanelCardProps {
  /** Visual variant determines styling */
  variant?: PanelCardVariant;
  /** Content to render inside the card */
  children: ReactNode;
  /** Optional additional class names */
  className?: string;
}

/**
 * PanelCard - Visual container for dashboard panels
 *
 * Responsibilities:
 * - Card styling (borders, backgrounds, padding, shadows)
 * - Visual variants for different panel types
 * - NO sizing or layout - that's handled by DashboardLayout
 */
export function PanelCard({
  variant = 'card',
  children,
  className = ''
}: PanelCardProps) {
  // No card styling - just content
  if (variant === 'none' || variant === 'flat') {
    return <div className={className}>{children}</div>;
  }

  // Hero variant - prominent header styling
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gray-900/50 p-6 md:p-8 backdrop-blur-xs border border-gray-800 h-full ${className}`}>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    );
  }

  // Sidebar variant - compact card for sidebar panels
  if (variant === 'sidebar') {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 ${className}`}>
        {children}
      </div>
    );
  }

  // Dark variant - recessed appearance for countdown/status bars
  if (variant === 'dark') {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gray-950/60 backdrop-blur-sm border border-gray-800/50 px-5 py-2 ${className}`}>
        {children}
      </div>
    );
  }

  // Default card variant - standard panel card
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[var(--color-gray-800)] bg-gray-900/40 backdrop-blur-sm p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * PanelCardSkeleton - Loading skeleton for panel cards
 */
export function PanelCardSkeleton({ variant = 'card' }: { variant?: PanelCardVariant }) {
  if (variant === 'none' || variant === 'flat') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-800 rounded" />
        <div className="h-32 bg-gray-800 rounded" />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-6 md:p-8 backdrop-blur-xs border border-gray-800 animate-pulse">
        <div className="h-10 bg-gray-800 rounded w-3/4" />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="relative overflow-hidden rounded-lg bg-background-primary/60 backdrop-blur-sm border border-gray-800 p-4 animate-pulse">
        <div className="h-20 bg-gray-800 rounded" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-[var(--color-gray-800)] bg-[var(--color-gray-900-40)] backdrop-blur-sm p-5 lg:p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-24 bg-gray-800 rounded" />
        <div className="h-32 bg-gray-800 rounded" />
      </div>
    </div>
  );
}
