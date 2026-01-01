/**
 * Hook for single file upload with progress tracking
 */

import { useState, useCallback } from 'react';
import type { UploadStatus, UploadProgress, UploadResult, UploadError } from '../types';
import { uploadMediaFile } from '../actions/uploadActions';

export interface UseMediaUploadOptions {
  bucket: string;
  generatePath?: (file: File) => string;
  onProgress?: (progress: number) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: UploadError) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<UploadError | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setStatus('uploading');
      setProgress(0);
      setError(null);
      setResult(null);

      try {
        // Generate path
        const path = options.generatePath ? options.generatePath(file) : undefined;

        // Simulate progress (in a real implementation, you'd track actual upload progress)
        // This is a simplified version - Supabase doesn't provide built-in progress tracking
        // For real progress, you'd need to implement chunked uploads
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Upload file
        const { result: uploadResult, error: uploadError } = await uploadMediaFile(
          options.bucket,
          file,
          path
        );

        clearInterval(progressInterval);

        if (uploadError) {
          setStatus('error');
          setError(uploadError);
          options.onError?.(uploadError);
          return;
        }

        if (uploadResult) {
          setStatus('success');
          setProgress(100);
          setResult(uploadResult);
          options.onComplete?.(uploadResult);
        }
      } catch (err) {
        setStatus('error');
        const uploadError: UploadError = {
          code: 'UPLOAD_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
          file,
        };
        setError(uploadError);
        options.onError?.(uploadError);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    upload,
    reset,
    status,
    progress,
    result,
    error,
    isUploading: status === 'uploading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
