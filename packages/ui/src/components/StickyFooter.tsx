'use client';

import { useState, useEffect, ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';

interface StickyFooterProps {
  /**
   * Icon to display in the floating button and header
   */
  icon?: LucideIcon;
  /**
   * Title text for the footer
   */
  title: string;
  /**
   * Content to display when open
   */
  children: ReactNode;
  /**
   * Height when open (default: 70vh)
   */
  height?: string;
  /**
   * Initial open state (default: false)
   */
  defaultOpen?: boolean;
  /**
   * Optional custom className for the floating button
   */
  buttonClassName?: string;
  /**
   * Optional custom className for the header
   */
  headerClassName?: string;
  /**
   * Optional custom className for the content area
   */
  contentClassName?: string;
  /**
   * Optional aria-label for accessibility
   */
  ariaLabel?: string;
}

export function StickyFooter({
  icon: Icon,
  title,
  children,
  height = '70vh',
  defaultOpen = false,
  buttonClassName,
  headerClassName,
  contentClassName,
  ariaLabel,
}: StickyFooterProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Listen for hash changes to open the footer
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#discussion') {
        setIsOpen(true);
        // Clear the hash after opening
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // When closed, show floating button
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={
            buttonClassName ||
            'flex items-center gap-2 rounded-full bg-[var(--color-accent-primary,#FFDD57)] px-4 py-3 text-black shadow-lg hover:bg-[var(--color-accent-secondary,#FFB84D)] transition-colors'
          }
          aria-label={ariaLabel || `Open ${title}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
          <span className="font-medium">{title}</span>
        </button>
      </div>
    );
  }

  // When open, show full footer
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-gray-900,#0F172A)] border-t border-[var(--color-gray-800,#1E293B)] shadow-2xl transition-all duration-300 ease-in-out"
      style={{ height }}
    >
      {/* Header with close button */}
      <div
        className={
          headerClassName ||
          'flex items-center justify-between px-4 py-3 border-b border-[var(--color-gray-800,#1E293B)] bg-[var(--color-gray-900,#0F172A)]'
        }
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--color-accent-primary,#FFDD57)]" />}
          <span className="font-semibold text-lg text-[var(--color-accent-primary,#FFDD57)]">{title}</span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label={`Close ${title}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div
        className={contentClassName || 'h-full'}
        style={{ height: `calc(${height} - 56px)` }}
      >
        {children}
      </div>
    </div>
  );
}
