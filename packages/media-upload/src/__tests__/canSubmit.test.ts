import { describe, it, expect } from 'vitest';
import { canSubmit, deriveSubmitConfig, type UploadStates, type SubmitConfig } from '../canSubmit';
import { initialUploadState, type UploadState } from '../uploadReducer';

const createUploadState = (overrides: Partial<UploadState> = {}): UploadState => ({
  ...initialUploadState,
  ...overrides,
});

const createCompleteState = (): UploadState =>
  createUploadState({
    file: new File(['test'], 'test.mp3'),
    status: 'complete',
    progress: 100,
    result: { url: 'https://example.com/test.mp3', path: 'test.mp3' },
  });

const createUploadingState = (): UploadState =>
  createUploadState({
    file: new File(['test'], 'test.mp3'),
    status: 'uploading',
    progress: 50,
  });

const createErrorState = (error: string = 'Upload failed'): UploadState =>
  createUploadState({
    file: new File(['test'], 'test.mp3'),
    status: 'error',
    error,
  });

describe('canSubmit', () => {
  describe('when uploads are in progress', () => {
    it('blocks submission when audio is uploading', () => {
      const uploads: UploadStates = {
        audio: createUploadingState(),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.pending).toContain('audio');
      expect(result.errors).toContain('Please wait for uploads to complete');
    });

    it('blocks submission when image is uploading', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadingState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.pending).toContain('image');
    });

    it('tracks multiple pending uploads', () => {
      const uploads: UploadStates = {
        audio: createUploadingState(),
        image: createUploadingState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.pending).toEqual(['audio', 'image']);
    });
  });

  describe('required audio', () => {
    it('blocks when audio is required but not uploaded', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: true,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.errors).toContain('Audio file is required');
    });

    it('allows when audio is required and uploaded', () => {
      const uploads: UploadStates = {
        audio: createCompleteState(),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: true,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('required image', () => {
    it('blocks when image is required but not uploaded', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: true,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.errors).toContain('Cover image is required');
    });

    it('allows when image is required and uploaded', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createCompleteState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: true,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(true);
    });
  });

  describe('audio OR lyrics required', () => {
    const config: SubmitConfig = {
      audioRequired: false,
      imageRequired: false,
      audioOrLyricsRequired: true,
    };

    it('blocks when neither audio nor lyrics provided', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadState(),
      };

      const result = canSubmit(uploads, config, false);

      expect(result.allowed).toBe(false);
      expect(result.errors).toContain('Please provide either an audio file or lyrics');
    });

    it('allows when audio provided without lyrics', () => {
      const uploads: UploadStates = {
        audio: createCompleteState(),
        image: createUploadState(),
      };

      const result = canSubmit(uploads, config, false);

      expect(result.allowed).toBe(true);
    });

    it('allows when lyrics provided without audio', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadState(),
      };

      const result = canSubmit(uploads, config, true);

      expect(result.allowed).toBe(true);
    });

    it('allows when both audio and lyrics provided', () => {
      const uploads: UploadStates = {
        audio: createCompleteState(),
        image: createUploadState(),
      };

      const result = canSubmit(uploads, config, true);

      expect(result.allowed).toBe(true);
    });
  });

  describe('upload errors', () => {
    it('reports audio error when audio is required', () => {
      const uploads: UploadStates = {
        audio: createErrorState('Network timeout'),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: true,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.errors.some(e => e.includes('Network timeout'))).toBe(true);
    });

    it('reports image error when image is required', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createErrorState('File too large'),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: true,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(false);
      expect(result.errors.some(e => e.includes('File too large'))).toBe(true);
    });
  });

  describe('nothing required', () => {
    it('allows submission when nothing is required', () => {
      const uploads: UploadStates = {
        audio: createUploadState(),
        image: createUploadState(),
      };
      const config: SubmitConfig = {
        audioRequired: false,
        imageRequired: false,
        audioOrLyricsRequired: false,
      };

      const result = canSubmit(uploads, config);

      expect(result.allowed).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.pending).toEqual([]);
    });
  });
});

describe('deriveSubmitConfig', () => {
  it('handles explicitly required audio', () => {
    const formConfig = {
      fields: {
        audioFile: { required: true, enabled: true },
        coverImage: { required: false, enabled: true },
        lyrics: { enabled: false },
      },
    };

    const config = deriveSubmitConfig(formConfig);

    expect(config.audioRequired).toBe(true);
    expect(config.audioOrLyricsRequired).toBe(false);
  });

  it('handles audio required via group when lyrics disabled', () => {
    const formConfig = {
      fields: {
        audioFile: { requiredGroup: 'content', enabled: true },
        coverImage: { required: false, enabled: true },
        lyrics: { enabled: false },
      },
    };

    const config = deriveSubmitConfig(formConfig);

    expect(config.audioRequired).toBe(true);
    expect(config.audioOrLyricsRequired).toBe(false);
  });

  it('handles audio-or-lyrics when both share required group', () => {
    const formConfig = {
      fields: {
        audioFile: { requiredGroup: 'content', enabled: true },
        coverImage: { required: false, enabled: true },
        lyrics: { requiredGroup: 'content', enabled: true },
      },
    };

    const config = deriveSubmitConfig(formConfig);

    expect(config.audioRequired).toBe(false);
    expect(config.audioOrLyricsRequired).toBe(true);
  });

  it('handles required image', () => {
    const formConfig = {
      fields: {
        audioFile: { enabled: true },
        coverImage: { required: true, enabled: true },
        lyrics: { enabled: false },
      },
    };

    const config = deriveSubmitConfig(formConfig);

    expect(config.imageRequired).toBe(true);
  });
});
