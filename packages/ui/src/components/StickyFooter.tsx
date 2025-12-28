'use client';

import { useState, useEffect, ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Text, Button, Animated } from "@eptss/ui";
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

  // Animation variants
  const slideUpVariants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  };

  const scaleInVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {!isOpen && (
        <Animated
          key="floating-button"
          customVariants={scaleInVariants}
          duration={0.15}
          className="fixed bottom-4 right-4 z-50"
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsOpen(true)}
            className={buttonClassName || 'rounded-full gap-2'}
            aria-label={ariaLabel || `Open ${title}`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            {title}
          </Button>
        </Animated>
      )}

      {isOpen && (
        <Animated
          key="discussion-panel"
          customVariants={slideUpVariants}
          duration={0.25}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-gray-900,#0F172A)] border-t border-[var(--color-gray-800,#1E293B)] shadow-2xl h-[95vh] md:h-auto"
          style={{ height: typeof window !== 'undefined' && window.innerWidth >= 768 ? height : undefined }}
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
              <Text as="span" size="lg" weight="semibold" className="text-[var(--color-accent-primary,#FFDD57)]">{title}</Text>
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
            style={{ height: `calc(100% - 56px)` }}
          >
            {children}
          </div>
        </Animated>
      )}
    </AnimatePresence>
  );
}
