'use client';

import { ReactNode, useState } from 'react';
import { PanelConfig } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PanelWrapperProps {
  config: PanelConfig;
  children: ReactNode;
}

/**
 * PanelWrapper - Wraps each panel with common functionality
 *
 * Handles:
 * - Collapsible behavior
 * - Consistent styling
 * - Error boundaries (future enhancement)
 * 
 * Note: This is a client component for interactivity (collapse/expand)
 * The actual panel content is rendered in the server component (Dashboard)
 */
export function PanelWrapper({ config, children }: PanelWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(
    config.collapsible ? config.defaultCollapsed ?? false : false
  );

  return (
    <div
      className={`w-full mb-6 ${config.className || ''}`}
      data-panel-id={config.id}
      data-priority={config.priority}
      data-size={config.size}
    >
      {config.collapsible && (
        <div className="mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-900/70 hover:border-[var(--color-accent-primary)] transition-all"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Expand ${config.name}` : `Collapse ${config.name}`}
          >
            <span className="text-lg font-semibold text-[var(--color-primary)]">
              {config.name}
            </span>
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      )}

      {!isCollapsed && <div>{children}</div>}
    </div>
  );
}
