/**
 * Simple upload hook using reducer pattern
 * Thin React wrapper around pure uploadReducer
 */

import { useReducer, useCallback } from 'react';
import {
  uploadReducer,
  initialUploadState,
  type UploadState,
  type UploadResult,
} from '../uploadReducer';
import { uploadWithSignedUrl } from '../utils/directUpload';
import { extractAudioMetadata, isAudioFile } from '../utils/audioMetadata';

export interface UseUploadOptions {
  bucket: string;
  /** Called when upload completes successfully */
  onComplete?: (result: UploadResult) => void;
  /** Called when upload fails */
  onError?: (error: string) => void;
}

export interface UseUploadReturn {
  /** Current upload state */
  state: UploadState;
  /** Select a file (does not start upload) */
  selectFile: (file: File) => void;
  /** Upload the currently selected file */
  upload: () => Promise<void>;
  /** Select and immediately upload a file */
  uploadFile: (file: File) => Promise<void>;
  /** Clear the upload state */
  clear: () => void;
  /** Retry a failed upload */
  retry: () => Promise<void>;
  /** Convenience getters */
  isIdle: boolean;
  isUploading: boolean;
  isComplete: boolean;
  isError: boolean;
}

export function useUpload(options: UseUploadOptions): UseUploadReturn {
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);

  const performUpload = useCallback(async (file: File) => {
    dispatch({ type: 'UPLOAD_START' });

    try {
      // Extract metadata for audio files (client-side)
      let metadata: Record<string, unknown> | undefined;
      if (isAudioFile(file)) {
        try {
          const audioMetadata = await extractAudioMetadata(file);
          metadata = { audio: audioMetadata };
        } catch (e) {
          // Non-fatal - continue without metadata
          console.warn('Failed to extract audio metadata:', e);
        }
      }

      // Simulate progress (we don't have real progress from signed URL uploads)
      const progressInterval = setInterval(() => {
        dispatch({ type: 'UPLOAD_PROGRESS', progress: Math.random() * 90 });
      }, 200);

      // Upload via signed URL
      const { result, error } = await uploadWithSignedUrl(
        options.bucket,
        file,
        undefined,
        { metadata }
      );

      clearInterval(progressInterval);

      if (error) {
        dispatch({ type: 'UPLOAD_ERROR', error: error.message });
        options.onError?.(error.message);
        return;
      }

      if (result) {
        const uploadResult: UploadResult = {
          url: result.url,
          path: result.path,
          fileSize: result.fileSize,
          metadata: result.metadata,
        };
        dispatch({ type: 'UPLOAD_SUCCESS', result: uploadResult });
        options.onComplete?.(uploadResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      dispatch({ type: 'UPLOAD_ERROR', error: errorMessage });
      options.onError?.(errorMessage);
    }
  }, [options]);

  const selectFile = useCallback((file: File) => {
    dispatch({ type: 'SELECT_FILE', file });
  }, []);

  const upload = useCallback(async () => {
    if (!state.file) {
      console.warn('No file selected');
      return;
    }
    await performUpload(state.file);
  }, [state.file, performUpload]);

  const uploadFile = useCallback(async (file: File) => {
    dispatch({ type: 'SELECT_FILE', file });
    await performUpload(file);
  }, [performUpload]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const retry = useCallback(async () => {
    if (state.file && state.status === 'error') {
      await performUpload(state.file);
    }
  }, [state.file, state.status, performUpload]);

  return {
    state,
    selectFile,
    upload,
    uploadFile,
    clear,
    retry,
    isIdle: state.status === 'idle',
    isUploading: state.status === 'uploading',
    isComplete: state.status === 'complete',
    isError: state.status === 'error',
  };
}
