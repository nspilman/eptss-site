/**
 * MediaUploader Component
 * Main orchestrator component that brings together all upload functionality
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import type { MediaUploaderProps, MediaUploaderState } from '../types';
import { FileInput } from './FileInput';
import { FileDropzone } from './FileDropzone';
import { FilePreview } from './FilePreview';
import { UploadQueue } from './UploadQueue';
import { ImageCropper } from './ImageCropper';
import { useFileValidation } from '../hooks/useFileValidation';
import { useUploadQueue } from '../hooks/useUploadQueue';
import { isImage } from '../utils/filePreview';
import { generateUniqueFileName } from '../utils/mimeTypes';

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  bucket,
  accept,
  maxSizeMB,
  minSizeMB,
  multiple = false,
  maxFiles,
  variant = 'both',
  showPreview = true,
  enableCrop = false,
  generatePath,
  customValidator,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onFilesSelected,
  className,
  disabled = false,
  placeholder,
  buttonText,
  autoUpload = true,
  children,
}) => {
  // State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Hooks
  const { filterValid } = useFileValidation({
    maxSizeMB,
    minSizeMB,
    accept,
    maxFiles,
    customValidator,
  });

  const uploadQueue = useUploadQueue({
    bucket,
    generatePath: generatePath
      ? (file) => generatePath('', file.name, file)
      : (file) => generateUniqueFileName(file.name),
    onProgress: onUploadProgress,
    onComplete: onUploadComplete,
    onError: onUploadError,
  });

  // Handle file selection
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      // Validate files
      const { validFiles, errors } = filterValid(files);

      // Set validation errors
      setValidationErrors(errors.map((e) => e.error));

      // If no valid files, don't proceed
      if (validFiles.length === 0) {
        return;
      }

      // Process first file for cropping if enabled
      if (enableCrop && validFiles.length > 0 && isImage(validFiles[0])) {
        setFileToProcess(validFiles[0]);
        setShowCropper(true);
        // Keep other files for later
        setSelectedFiles(validFiles.slice(1));
      } else {
        setSelectedFiles(validFiles);

        // Auto-upload if enabled
        if (autoUpload) {
          const queueItems = uploadQueue.addFiles(validFiles);
          // Start uploading after files are added
          setTimeout(() => uploadQueue.uploadAll(), 0);
        } else {
          uploadQueue.addFiles(validFiles);
        }
      }

      // Notify parent
      onFilesSelected?.(validFiles);
      if (autoUpload) {
        onUploadStart?.(validFiles);
      }
    },
    [filterValid, enableCrop, autoUpload, uploadQueue, onFilesSelected, onUploadStart]
  );

  // Handle crop complete
  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      setShowCropper(false);
      setFileToProcess(null);

      const allFiles = [croppedFile, ...selectedFiles];
      setSelectedFiles(allFiles);

      if (autoUpload) {
        const queueItems = uploadQueue.addFiles(allFiles);
        setTimeout(() => uploadQueue.uploadAll(), 0);
        onUploadStart?.(allFiles);
      } else {
        uploadQueue.addFiles(allFiles);
      }
    },
    [selectedFiles, autoUpload, uploadQueue, onUploadStart]
  );

  // Handle crop cancel
  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    setFileToProcess(null);

    if (selectedFiles.length > 0) {
      if (autoUpload) {
        const queueItems = uploadQueue.addFiles(selectedFiles);
        setTimeout(() => uploadQueue.uploadAll(), 0);
        onUploadStart?.(selectedFiles);
      } else {
        uploadQueue.addFiles(selectedFiles);
      }
    }
  }, [selectedFiles, autoUpload, uploadQueue, onUploadStart]);

  // Handle remove file
  const handleRemoveFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  // Manual upload trigger
  const startUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onUploadStart?.(selectedFiles);
      uploadQueue.uploadAll();
    }
  }, [selectedFiles, uploadQueue, onUploadStart]);

  // State for custom rendering
  const uploaderState: MediaUploaderState = {
    files: selectedFiles,
    uploads: uploadQueue.items,
    status: uploadQueue.status,
    isUploading: uploadQueue.isUploading,
    validationErrors,
    results: uploadQueue.results,
    selectFiles: () => {}, // Will be implemented by child components
    startUpload,
    cancelAll: uploadQueue.cancelAll,
    clear: () => {
      setSelectedFiles([]);
      setValidationErrors([]);
      uploadQueue.clearAll();
    },
  };

  // Custom render
  if (children) {
    return <div className={className}>{children(uploaderState)}</div>;
  }

  // Cropper view
  if (showCropper && fileToProcess) {
    return (
      <div className={clsx('flex flex-col gap-4', className)}>
        <ImageCropper
          file={fileToProcess}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      </div>
    );
  }

  // Convert accept for different components
  const dropzoneAccept: Record<string, string[]> | undefined = accept
    ? typeof accept === 'string'
      ? { [accept]: [] }
      : Array.isArray(accept)
        ? accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
        : accept as Record<string, string[]>
    : undefined;

  const inputAccept = Array.isArray(accept) ? accept.join(',') : accept;

  // Default render
  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      {/* Upload Interface */}
      {variant === 'dropzone' && (
        <FileDropzone
          accept={dropzoneAccept}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}

      {variant === 'button' && (
        <FileInput
          accept={inputAccept}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
          disabled={disabled}
          buttonText={buttonText}
        />
      )}

      {variant === 'both' && (
        <>
          <FileDropzone
            accept={dropzoneAccept}
            multiple={multiple}
            onFilesSelected={handleFilesSelected}
            disabled={disabled}
            placeholder={placeholder}
          />
          <div className="text-center">
            <p className="text-xs text-[var(--color-gray-400)] mb-2">or</p>
            <FileInput
              accept={inputAccept}
              multiple={multiple}
              onFilesSelected={handleFilesSelected}
              disabled={disabled}
              buttonText={buttonText}
              className="inline-block"
            />
          </div>
        </>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-md">
          <p className="text-sm text-red-500 font-medium mb-1">Validation Errors:</p>
          <ul className="text-xs text-red-500 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File Previews (before upload or when autoUpload is false) */}
      {showPreview && selectedFiles.length > 0 && uploadQueue.items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFiles.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              showRemove
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}

      {/* Upload Queue */}
      {uploadQueue.items.length > 0 && (
        <UploadQueue items={uploadQueue.items} showCancel showRetry />
      )}

      {/* Manual Upload Button (when autoUpload is false) */}
      {!autoUpload && selectedFiles.length > 0 && !uploadQueue.isUploading && (
        <button
          type="button"
          onClick={startUpload}
          className={clsx(
            'px-4 py-2 rounded-md',
            'bg-[var(--color-accent-primary)] text-[var(--color-background-primary)]',
            'font-medium text-sm',
            'hover:opacity-90',
            'transition-opacity duration-200'
          )}
        >
          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
        </button>
      )}
    </div>
  );
};
