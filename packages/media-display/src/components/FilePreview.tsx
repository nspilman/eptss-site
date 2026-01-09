/**
 * FilePreview Component
 * Smart preview component that renders appropriate preview based on file type
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FileIcon, FileText, FileVideo, FileImage, FileAudio, X } from 'lucide-react';
import { Button, Text, cn } from '@eptss/ui';
import { getFileCategory } from '../utils/fileCategory';
import { createPreviewUrl, revokePreviewUrl } from '../utils/preview';
import { formatFileSize } from '../utils/formatting';
import { AudioPreview } from './AudioPreview';

export interface FilePreviewProps {
  /** File to preview */
  file: File;
  /** Show remove button */
  showRemove?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Show file details */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  showRemove = false,
  onRemove,
  showDetails = true,
  className,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const category = getFileCategory(file.type);

  useEffect(() => {
    if (category === 'image' || category === 'video') {
      const url = createPreviewUrl(file);
      setPreviewUrl(url);

      return () => {
        revokePreviewUrl(url);
      };
    }
  }, [file, category]);

  const getFileIcon = () => {
    switch (category) {
      case 'image':
        return <FileImage className="w-6 h-6" />;
      case 'video':
        return <FileVideo className="w-6 h-6" />;
      case 'audio':
        return <FileAudio className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileIcon className="w-6 h-6" />;
    }
  };

  // Audio files get special treatment
  if (category === 'audio') {
    return (
      <div className={cn('relative', className)}>
        <AudioPreview file={file} showWaveform={true} />
        {showRemove && onRemove && (
          <Button
            onClick={onRemove}
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Image preview
  if (category === 'image' && previewUrl) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative aspect-square max-w-xs w-full bg-[var(--color-gray-700)] rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {showRemove && onRemove && (
            <Button
              onClick={onRemove}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {showDetails && (
          <Text size="xs" color="muted" className="mt-2 truncate">{file.name}</Text>
        )}
      </div>
    );
  }

  // Video preview
  if (category === 'video' && previewUrl) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative aspect-video w-full bg-[var(--color-gray-700)] rounded-lg overflow-hidden">
          <video
            src={previewUrl}
            controls
            className="w-full h-full"
          />
          {showRemove && onRemove && (
            <Button
              onClick={onRemove}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {showDetails && (
          <Text size="xs" color="muted" className="mt-2 truncate">{file.name}</Text>
        )}
      </div>
    );
  }

  // Generic file preview (document, other)
  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-3 p-4 bg-[var(--color-gray-700)] rounded-lg">
        <div className="flex-shrink-0 text-[var(--color-accent-primary)]">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <Text size="sm" weight="medium" className="truncate">
            {file.name}
          </Text>
          {showDetails && (
            <Text size="xs" color="muted" className="mt-0.5">
              {formatFileSize(file.size)}
            </Text>
          )}
        </div>
        {showRemove && onRemove && (
          <Button
            onClick={onRemove}
            size="icon"
            variant="ghost"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
