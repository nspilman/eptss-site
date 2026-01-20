/**
 * Pure state machine for upload management
 * No side effects - easily testable
 */

export type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface UploadResult {
  url: string;
  path: string;
  fileSize?: number;
  metadata?: Record<string, unknown>;
}

export interface UploadState {
  file: File | null;
  status: UploadStatus;
  progress: number;
  result: UploadResult | null;
  error: string | null;
}

export type UploadAction =
  | { type: 'SELECT_FILE'; file: File }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_SUCCESS'; result: UploadResult }
  | { type: 'UPLOAD_ERROR'; error: string }
  | { type: 'CLEAR' };

export const initialUploadState: UploadState = {
  file: null,
  status: 'idle',
  progress: 0,
  result: null,
  error: null,
};

export function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'SELECT_FILE':
      return {
        ...initialUploadState,
        file: action.file,
        status: 'idle',
      };

    case 'UPLOAD_START':
      return {
        ...state,
        status: 'uploading',
        progress: 0,
        error: null,
      };

    case 'UPLOAD_PROGRESS':
      return {
        ...state,
        progress: Math.min(100, Math.max(0, action.progress)),
      };

    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        status: 'complete',
        progress: 100,
        result: action.result,
        error: null,
      };

    case 'UPLOAD_ERROR':
      return {
        ...state,
        status: 'error',
        progress: 0,
        result: null,
        error: action.error,
      };

    case 'CLEAR':
      return initialUploadState;

    default:
      return state;
  }
}
