/**
 * FileInput Component
 * Simple file input with button interface
 */

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button, cn } from '@eptss/ui';

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
    <div className={cn('inline-block', className)}>
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
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="default"
        size="md"
      >
        {showIcon && <Upload className="w-4 h-4" />}
        {buttonText}
      </Button>
    </div>
  );
};
