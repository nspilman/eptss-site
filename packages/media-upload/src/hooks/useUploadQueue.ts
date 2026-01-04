/**
 * Hook for managing multiple file uploads with queue
 */

import { useState, useCallback, useRef } from 'react';
import type { UploadQueueItem, UploadResult, UploadError, UploadStatus } from '../types';
import { uploadMediaFile } from '../actions/uploadActions';
import { extractAudioMetadata, isAudioFile } from '../utils/audioMetadata';

export interface UseUploadQueueOptions {
  bucket: string;
  generatePath?: (file: File) => string;
  onProgress?: (items: UploadQueueItem[]) => void;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: UploadError) => void;
  maxConcurrent?: number;
}

export function useUploadQueue(options: UseUploadQueueOptions) {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  /**
   * Generate unique ID for queue item
   */
  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  /**
   * Add files to the upload queue
   */
  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'idle' as UploadStatus,
      cancel: () => {}, // Will be set during upload
      retry: () => {}, // Will be set during upload
    }));

    setItems((prev) => [...prev, ...newItems]);
    return newItems;
  }, []);

  /**
   * Update a specific queue item
   */
  const updateItem = useCallback((id: string, updates: Partial<UploadQueueItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  /**
   * Remove an item from the queue
   */
  const removeItem = useCallback((id: string) => {
    // Cancel upload if in progress
    const controller = abortControllersRef.current.get(id);
    controller?.abort();
    abortControllersRef.current.delete(id);

    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /**
   * Upload a single file from the queue
   */
  const uploadFile = useCallback(
    async (item: UploadQueueItem) => {
      const controller = new AbortController();
      abortControllersRef.current.set(item.id, controller);

      updateItem(item.id, { status: 'uploading', progress: 0 });

      try {
        const path = options.generatePath ? options.generatePath(item.file) : undefined;

        // Extract metadata if this is an audio file (client-side)
        let metadata: Record<string, unknown> | undefined;
        if (isAudioFile(item.file)) {
          const audioMetadata = await extractAudioMetadata(item.file);
          metadata = { audio: audioMetadata };
        }

        // Simulate progress updates
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 10, 90);
          updateItem(item.id, {
            progress: currentProgress,
          });
        }, 100);

        const { result, error } = await uploadMediaFile(options.bucket, item.file, path, {
          metadata,
        });

        clearInterval(progressInterval);
        abortControllersRef.current.delete(item.id);

        if (error) {
          updateItem(item.id, {
            status: 'error',
            error,
            progress: 0,
          });
          options.onError?.(error);
          return null;
        }

        if (result) {
          updateItem(item.id, {
            status: 'success',
            progress: 100,
            result,
          });

          // Update results immediately for real-time tracking
          setResults((prev) => [...prev, result]);

          return result;
        }

        return null;
      } catch (err) {
        const error: UploadError = {
          code: 'UPLOAD_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
          file: item.file,
        };

        updateItem(item.id, {
          status: 'error',
          error,
          progress: 0,
        });

        options.onError?.(error);
        return null;
      }
    },
    [options, updateItem]
  );

  /**
   * Upload all files in the queue
   */
  const uploadAll = useCallback(async () => {
    // Clear previous results before starting new upload batch
    setResults([]);
    setStatus('uploading');
    const uploadResults: UploadResult[] = [];

    const maxConcurrent = options.maxConcurrent || 3;
    const pendingItems = items.filter((item) => item.status === 'idle' || item.status === 'error');

    // Upload files with concurrency control
    const uploadNext = async (index: number): Promise<void> => {
      if (index >= pendingItems.length) return;

      const item = pendingItems[index];
      const result = await uploadFile(item);

      // Collect results from successful uploads for final callback
      if (result) {
        uploadResults.push(result);
      }

      // Upload next file
      await uploadNext(index + maxConcurrent);
    };

    // Start concurrent uploads
    const uploadPromises: Promise<void>[] = [];
    for (let i = 0; i < Math.min(maxConcurrent, pendingItems.length); i++) {
      uploadPromises.push(uploadNext(i));
    }

    await Promise.all(uploadPromises);

    // Note: results state is updated incrementally in uploadFile()
    // No need to batch update here

    // Check if all succeeded
    const hasErrors = items.some((item) => item.status === 'error');
    setStatus(hasErrors ? 'error' : 'success');

    // Call onComplete with all collected results
    if (!hasErrors && uploadResults.length > 0) {
      options.onComplete?.(uploadResults);
    }
  }, [items, options, uploadFile]);

  /**
   * Cancel a specific upload
   */
  const cancel = useCallback(
    (id: string) => {
      const controller = abortControllersRef.current.get(id);
      controller?.abort();
      abortControllersRef.current.delete(id);

      updateItem(id, { status: 'cancelled', progress: 0 });
    },
    [updateItem]
  );

  /**
   * Retry a failed upload
   */
  const retry = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        uploadFile(item);
      }
    },
    [items, uploadFile]
  );

  /**
   * Cancel all uploads
   */
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();

    setItems((prev) =>
      prev.map((item) =>
        item.status === 'uploading' ? { ...item, status: 'cancelled' as UploadStatus } : item
      )
    );
    setStatus('cancelled');
  }, []);

  /**
   * Clear all completed/errored items
   */
  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter((item) => item.status !== 'success' && item.status !== 'error')
    );
  }, []);

  /**
   * Clear all items
   */
  const clearAll = useCallback(() => {
    cancelAll();
    setItems([]);
    setResults([]);
    setStatus('idle');
  }, [cancelAll]);

  /**
   * Add files and immediately upload them (bypasses state timing issues)
   */
  const addAndUploadFiles = useCallback(async (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'idle' as UploadStatus,
      cancel: () => {}, // Will be set during upload
      retry: () => {}, // Will be set during upload
    }));

    // Add to state
    setItems((prev) => [...prev, ...newItems]);

    // Clear previous results before starting new upload batch
    setResults([]);

    // Upload immediately using the items we just created
    setStatus('uploading');
    const uploadResults: UploadResult[] = [];
    const maxConcurrent = options.maxConcurrent || 3;

    // Upload files with concurrency control
    const uploadNext = async (index: number): Promise<void> => {
      if (index >= newItems.length) return;

      const item = newItems[index];
      const result = await uploadFile(item);

      // Collect results from successful uploads for final callback
      if (result) {
        uploadResults.push(result);
      }

      // Upload next file
      await uploadNext(index + maxConcurrent);
    };

    // Start concurrent uploads
    const uploadPromises: Promise<void>[] = [];
    for (let i = 0; i < Math.min(maxConcurrent, newItems.length); i++) {
      uploadPromises.push(uploadNext(i));
    }

    await Promise.all(uploadPromises);

    // Note: results state is updated incrementally in uploadFile()
    // No need to batch update here

    // Check if all succeeded (check newItems, not state items)
    const hasErrors = newItems.some((item) => item.status === 'error');
    setStatus(hasErrors ? 'error' : 'success');

    // Call onComplete with all collected results
    if (!hasErrors && uploadResults.length > 0) {
      options.onComplete?.(uploadResults);
    }
  }, [options, uploadFile]);

  return {
    items,
    results,
    status,
    addFiles,
    uploadAll,
    uploadFile,
    addAndUploadFiles,
    cancel,
    retry,
    removeItem,
    cancelAll,
    clearCompleted,
    clearAll,
    isUploading: status === 'uploading',
    isComplete: status === 'success',
    hasErrors: items.some((item) => item.status === 'error'),
  };
}
