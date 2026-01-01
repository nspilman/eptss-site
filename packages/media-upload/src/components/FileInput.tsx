/**
 * FileInput Component
 * Simple file input with button interface
 */

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { clsx } from 'clsx';

export interface FileInputProps {
  /** Accept pattern for file types */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Button text */
  buttonText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({
  accept,
  multiple = false,
  onFilesSelected,
  disabled = false,
  buttonText = 'Choose Files',
  className,
  showIcon = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected?.(files);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  return (
    <div className={clsx('inline-block', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        aria-label={buttonText}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2',
          'px-4 py-2 rounded-md',
          'bg-[var(--color-accent-primary)] text-[var(--color-background-primary)]',
          'font-medium text-sm',
          'shadow-sm hover:shadow-[0_0_20px_4px_rgba(226,226,64,0.6)]',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm',
          'cursor-pointer'
        )}
      >
        {showIcon && <Upload className="w-4 h-4" />}
        <span>{buttonText}</span>
      </button>
    </div>
  );
};
