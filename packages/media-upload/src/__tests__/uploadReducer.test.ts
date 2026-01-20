import { describe, it, expect } from 'vitest';
import {
  uploadReducer,
  initialUploadState,
  type UploadState,
  type UploadAction,
} from '../uploadReducer';

describe('uploadReducer', () => {
  describe('SELECT_FILE', () => {
    it('sets file and resets to idle state', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
      const action: UploadAction = { type: 'SELECT_FILE', file };

      const result = uploadReducer(initialUploadState, action);

      expect(result.file).toBe(file);
      expect(result.status).toBe('idle');
      expect(result.progress).toBe(0);
      expect(result.result).toBeNull();
      expect(result.error).toBeNull();
    });

    it('clears previous upload state when selecting new file', () => {
      const previousState: UploadState = {
        file: new File(['old'], 'old.mp3'),
        status: 'complete',
        progress: 100,
        result: { url: 'https://example.com/old.mp3', path: 'old.mp3' },
        error: null,
      };
      const newFile = new File(['new'], 'new.mp3');
      const action: UploadAction = { type: 'SELECT_FILE', file: newFile };

      const result = uploadReducer(previousState, action);

      expect(result.file).toBe(newFile);
      expect(result.status).toBe('idle');
      expect(result.result).toBeNull();
    });
  });

  describe('UPLOAD_START', () => {
    it('sets status to uploading and resets progress', () => {
      const state: UploadState = {
        ...initialUploadState,
        file: new File(['test'], 'test.mp3'),
      };
      const action: UploadAction = { type: 'UPLOAD_START' };

      const result = uploadReducer(state, action);

      expect(result.status).toBe('uploading');
      expect(result.progress).toBe(0);
      expect(result.error).toBeNull();
    });

    it('clears previous error when starting new upload', () => {
      const state: UploadState = {
        ...initialUploadState,
        file: new File(['test'], 'test.mp3'),
        status: 'error',
        error: 'Previous error',
      };
      const action: UploadAction = { type: 'UPLOAD_START' };

      const result = uploadReducer(state, action);

      expect(result.status).toBe('uploading');
      expect(result.error).toBeNull();
    });
  });

  describe('UPLOAD_PROGRESS', () => {
    it('updates progress value', () => {
      const state: UploadState = {
        ...initialUploadState,
        status: 'uploading',
        progress: 0,
      };
      const action: UploadAction = { type: 'UPLOAD_PROGRESS', progress: 50 };

      const result = uploadReducer(state, action);

      expect(result.progress).toBe(50);
    });

    it('clamps progress to 0-100 range', () => {
      const state: UploadState = {
        ...initialUploadState,
        status: 'uploading',
      };

      const overResult = uploadReducer(state, { type: 'UPLOAD_PROGRESS', progress: 150 });
      expect(overResult.progress).toBe(100);

      const underResult = uploadReducer(state, { type: 'UPLOAD_PROGRESS', progress: -10 });
      expect(underResult.progress).toBe(0);
    });
  });

  describe('UPLOAD_SUCCESS', () => {
    it('sets complete status and stores result', () => {
      const state: UploadState = {
        ...initialUploadState,
        file: new File(['test'], 'test.mp3'),
        status: 'uploading',
        progress: 90,
      };
      const result = { url: 'https://example.com/test.mp3', path: 'audio/test.mp3' };
      const action: UploadAction = { type: 'UPLOAD_SUCCESS', result };

      const newState = uploadReducer(state, action);

      expect(newState.status).toBe('complete');
      expect(newState.progress).toBe(100);
      expect(newState.result).toEqual(result);
      expect(newState.error).toBeNull();
    });

    it('preserves file reference', () => {
      const file = new File(['test'], 'test.mp3');
      const state: UploadState = {
        ...initialUploadState,
        file,
        status: 'uploading',
      };
      const action: UploadAction = {
        type: 'UPLOAD_SUCCESS',
        result: { url: 'https://example.com/test.mp3', path: 'test.mp3' },
      };

      const newState = uploadReducer(state, action);

      expect(newState.file).toBe(file);
    });
  });

  describe('UPLOAD_ERROR', () => {
    it('sets error status and message', () => {
      const state: UploadState = {
        ...initialUploadState,
        file: new File(['test'], 'test.mp3'),
        status: 'uploading',
        progress: 50,
      };
      const action: UploadAction = { type: 'UPLOAD_ERROR', error: 'Upload failed' };

      const newState = uploadReducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.error).toBe('Upload failed');
      expect(newState.progress).toBe(0);
      expect(newState.result).toBeNull();
    });

    it('preserves file for retry', () => {
      const file = new File(['test'], 'test.mp3');
      const state: UploadState = {
        ...initialUploadState,
        file,
        status: 'uploading',
      };
      const action: UploadAction = { type: 'UPLOAD_ERROR', error: 'Network error' };

      const newState = uploadReducer(state, action);

      expect(newState.file).toBe(file);
    });
  });

  describe('CLEAR', () => {
    it('resets to initial state', () => {
      const state: UploadState = {
        file: new File(['test'], 'test.mp3'),
        status: 'complete',
        progress: 100,
        result: { url: 'https://example.com/test.mp3', path: 'test.mp3' },
        error: null,
      };
      const action: UploadAction = { type: 'CLEAR' };

      const newState = uploadReducer(state, action);

      expect(newState).toEqual(initialUploadState);
    });
  });

  describe('unknown action', () => {
    it('returns current state for unknown action', () => {
      const state: UploadState = {
        ...initialUploadState,
        file: new File(['test'], 'test.mp3'),
      };
      // @ts-expect-error - testing unknown action
      const newState = uploadReducer(state, { type: 'UNKNOWN' });

      expect(newState).toBe(state);
    });
  });
});
