/**
 * UploadProgress Component
 * Display upload progress with progress bar
 */

import React from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { UploadStatus } from '../types';
import { formatFileSize } from '../utils/fileValidation';

export interface UploadProgressProps {
  /** File name being uploaded */
  fileName: string;
  /** File size in bytes */
  fileSize?: number;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: UploadStatus;
  /** Error message if status is 'error' */
  error?: string;
  /** Show cancel button */
  showCancel?: boolean;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Show retry button for errors */
  showRetry?: boolean;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  fileSize,
  progress,
  status,
  error,
  showCancel = false,
  onCancel,
  showRetry = false,
  onRetry,
  className,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
      case 'validating':
        return <Loader2 className="w-5 h-5 text-[var(--color-accent-primary)] animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Upload complete';
      case 'error':
        return error || 'Upload failed';
      case 'uploading':
        return `Uploading... ${Math.round(progress)}%`;
      case 'validating':
        return 'Validating...';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Waiting...';
    }
  };

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-primary)] truncate">
              {fileName}
            </p>
            <p
              className={clsx('text-xs mt-0.5', {
                'text-green-500': status === 'success',
                'text-red-500': status === 'error',
                'text-[var(--color-gray-400)]': status !== 'success' && status !== 'error',
              })}
            >
              {getStatusText()}
              {fileSize && status !== 'error' && ` • ${formatFileSize(fileSize)}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showRetry && status === 'error' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-[var(--color-accent-primary)] hover:underline"
            >
              Retry
            </button>
          )}
          {showCancel && (status === 'uploading' || status === 'validating') && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded hover:bg-[var(--color-gray-700)] transition-colors"
              aria-label="Cancel upload"
            >
              <X className="w-4 h-4 text-[var(--color-gray-400)]" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'validating') && (
        <div className="w-full bg-[var(--color-gray-700)] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent-primary)] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
