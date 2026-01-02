/**
 * UploadQueue Component
 * Display a list of files being uploaded with their progress
 */

import React from 'react';
import { Text, cn } from '@eptss/ui';
import type { UploadQueueItem } from '../types';
import { UploadProgress } from './UploadProgress';

export interface UploadQueueProps {
  /** Queue items to display */
  items: UploadQueueItem[];
  /** Show cancel buttons */
  showCancel?: boolean;
  /** Show retry buttons */
  showRetry?: boolean;
  /** Maximum items to display (older items hidden) */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
}

export const UploadQueue: React.FC<UploadQueueProps> = ({
  items,
  showCancel = true,
  showRetry = true,
  maxVisible,
  className,
}) => {
  // Show most recent items if maxVisible is set
  const visibleItems = maxVisible ? items.slice(-maxVisible) : items;
  const hiddenCount = items.length - visibleItems.length;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {hiddenCount > 0 && (
        <Text size="xs" color="muted" className="text-center">
          {hiddenCount} more {hiddenCount === 1 ? 'file' : 'files'} uploading...
        </Text>
      )}

      {visibleItems.map((item) => (
        <UploadProgress
          key={item.id}
          fileName={item.file.name}
          fileSize={item.file.size}
          progress={item.progress}
          status={item.status}
          error={item.error?.message}
          showCancel={showCancel}
          onCancel={item.cancel}
          showRetry={showRetry}
          onRetry={item.retry}
        />
      ))}
    </div>
  );
};
