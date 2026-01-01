/**
 * FileDropzone Component
 * Drag-and-drop file upload zone
 */

import React, { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { Upload, FileIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface FileDropzoneProps {
  /** Accept pattern for file types */
  accept?: Record<string, string[]> | string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Callback when files are dropped/selected */
  onFilesSelected?: (files: File[]) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  maxSize,
  onFilesSelected,
  disabled = false,
  placeholder,
  className,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected?.(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  // Convert accept pattern to react-dropzone format
  const acceptObject = typeof accept === 'string'
    ? { [accept]: [] }
    : accept;

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: acceptObject,
    multiple,
    maxSize,
    disabled,
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone(dropzoneOptions);

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    if (isDragActive) return 'Drop files here...';
    return multiple
      ? 'Drag and drop files here, or click to select'
      : 'Drag and drop a file here, or click to select';
  };

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative',
        'border-2 border-dashed rounded-lg',
        'p-8',
        'flex flex-col items-center justify-center gap-4',
        'transition-all duration-200',
        'cursor-pointer',
        {
          'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10': isDragActive && !isDragReject,
          'border-red-500 bg-red-500/10': isDragReject,
          'border-[var(--color-gray-700)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/5':
            !isDragActive && !isDragReject && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className={clsx(
          'w-12 h-12 rounded-full',
          'flex items-center justify-center',
          'transition-colors duration-200',
          {
            'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]':
              isDragActive && !isDragReject,
            'bg-red-500/20 text-red-500': isDragReject,
            'bg-[var(--color-gray-700)] text-[var(--color-gray-400)]':
              !isDragActive && !isDragReject,
          }
        )}
      >
        {isDragActive ? (
          <Upload className="w-6 h-6" />
        ) : (
          <FileIcon className="w-6 h-6" />
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p
          className={clsx('text-sm font-medium', {
            'text-[var(--color-accent-primary)]': isDragActive && !isDragReject,
            'text-red-500': isDragReject,
            'text-[var(--color-primary)]': !isDragActive && !isDragReject,
          })}
        >
          {isDragReject ? 'File type not accepted' : getPlaceholderText()}
        </p>
        {!isDragActive && !isDragReject && (
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            {multiple ? 'Select multiple files' : 'Select a file'}
          </p>
        )}
      </div>
    </div>
  );
};
