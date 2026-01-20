import { describe, it, expect } from 'vitest';
import { buildPayload, payloadToFormData, type UploadStates, type TextFields } from '../buildPayload';
import { initialUploadState, type UploadState } from '../uploadReducer';

const createUploadState = (overrides: Partial<UploadState> = {}): UploadState => ({
  ...initialUploadState,
  ...overrides,
});

const createCompleteAudioState = (): UploadState =>
  createUploadState({
    file: new File(['test'], 'test.mp3'),
    status: 'complete',
    progress: 100,
    result: {
      url: 'https://storage.example.com/audio/test.mp3',
      path: 'audio/test.mp3',
      fileSize: 5000000,
      metadata: {
        audio: { duration: 180 },
      },
    },
  });

const createCompleteImageState = (): UploadState =>
  createUploadState({
    file: new File(['test'], 'cover.jpg'),
    status: 'complete',
    progress: 100,
    result: {
      url: 'https://storage.example.com/images/cover.jpg',
      path: 'images/cover.jpg',
    },
  });

describe('buildPayload', () => {
  it('builds complete payload with all uploads and text fields', () => {
    const uploads: UploadStates = {
      audio: createCompleteAudioState(),
      image: createCompleteImageState(),
    };
    const textFields: TextFields = {
      lyrics: 'Test lyrics',
      coolThingsLearned: 'Learned something cool',
      toolsUsed: 'Ableton, Pro Tools',
      happyAccidents: 'Found a nice chord',
      didntWork: 'Initial idea was scrapped',
    };

    const payload = buildPayload(123, uploads, textFields);

    expect(payload.roundId).toBe(123);
    expect(payload.audioFileUrl).toBe('https://storage.example.com/audio/test.mp3');
    expect(payload.audioFilePath).toBe('audio/test.mp3');
    expect(payload.audioFileSize).toBe(5000000);
    expect(payload.audioDuration).toBe(180);
    expect(payload.coverImageUrl).toBe('https://storage.example.com/images/cover.jpg');
    expect(payload.coverImagePath).toBe('images/cover.jpg');
    expect(payload.lyrics).toBe('Test lyrics');
    expect(payload.coolThingsLearned).toBe('Learned something cool');
    expect(payload.toolsUsed).toBe('Ableton, Pro Tools');
    expect(payload.happyAccidents).toBe('Found a nice chord');
    expect(payload.didntWork).toBe('Initial idea was scrapped');
  });

  it('handles missing audio upload', () => {
    const uploads: UploadStates = {
      audio: createUploadState(),
      image: createCompleteImageState(),
    };
    const textFields: TextFields = { lyrics: 'Lyrics only submission' };

    const payload = buildPayload(456, uploads, textFields);

    expect(payload.audioFileUrl).toBe('');
    expect(payload.audioFilePath).toBe('');
    expect(payload.audioFileSize).toBeUndefined();
    expect(payload.audioDuration).toBeUndefined();
    expect(payload.coverImageUrl).toBe('https://storage.example.com/images/cover.jpg');
    expect(payload.lyrics).toBe('Lyrics only submission');
  });

  it('handles missing image upload', () => {
    const uploads: UploadStates = {
      audio: createCompleteAudioState(),
      image: createUploadState(),
    };
    const textFields: TextFields = {};

    const payload = buildPayload(789, uploads, textFields);

    expect(payload.audioFileUrl).toBe('https://storage.example.com/audio/test.mp3');
    expect(payload.coverImageUrl).toBe('');
    expect(payload.coverImagePath).toBe('');
  });

  it('handles empty text fields', () => {
    const uploads: UploadStates = {
      audio: createCompleteAudioState(),
      image: createUploadState(),
    };
    const textFields: TextFields = {};

    const payload = buildPayload(1, uploads, textFields);

    expect(payload.lyrics).toBe('');
    expect(payload.coolThingsLearned).toBe('');
    expect(payload.toolsUsed).toBe('');
    expect(payload.happyAccidents).toBe('');
    expect(payload.didntWork).toBe('');
  });

  it('handles audio without duration metadata', () => {
    const uploads: UploadStates = {
      audio: createUploadState({
        status: 'complete',
        result: {
          url: 'https://storage.example.com/audio/test.mp3',
          path: 'audio/test.mp3',
          // No metadata
        },
      }),
      image: createUploadState(),
    };
    const textFields: TextFields = {};

    const payload = buildPayload(1, uploads, textFields);

    expect(payload.audioDuration).toBeUndefined();
  });
});

describe('payloadToFormData', () => {
  it('converts payload to FormData with all values', () => {
    const payload = buildPayload(
      123,
      {
        audio: createCompleteAudioState(),
        image: createCompleteImageState(),
      },
      { lyrics: 'Test lyrics' }
    );

    const formData = payloadToFormData(payload);

    expect(formData.get('roundId')).toBe('123');
    expect(formData.get('audioFileUrl')).toBe('https://storage.example.com/audio/test.mp3');
    expect(formData.get('audioFilePath')).toBe('audio/test.mp3');
    expect(formData.get('audioFileSize')).toBe('5000000');
    expect(formData.get('audioDuration')).toBe('180');
    expect(formData.get('coverImageUrl')).toBe('https://storage.example.com/images/cover.jpg');
    expect(formData.get('lyrics')).toBe('Test lyrics');
  });

  it('excludes empty string values', () => {
    const payload = buildPayload(
      123,
      {
        audio: createUploadState(),
        image: createUploadState(),
      },
      {}
    );

    const formData = payloadToFormData(payload);

    expect(formData.get('roundId')).toBe('123');
    expect(formData.get('audioFileUrl')).toBeNull();
    expect(formData.get('coverImageUrl')).toBeNull();
    expect(formData.get('lyrics')).toBeNull();
  });

  it('excludes undefined values', () => {
    const payload = buildPayload(
      123,
      {
        audio: createUploadState({
          status: 'complete',
          result: { url: 'https://example.com/test.mp3', path: 'test.mp3' },
        }),
        image: createUploadState(),
      },
      {}
    );

    const formData = payloadToFormData(payload);

    // audioFileSize and audioDuration are undefined
    expect(formData.get('audioFileSize')).toBeNull();
    expect(formData.get('audioDuration')).toBeNull();
    // But audioFileUrl is present
    expect(formData.get('audioFileUrl')).toBe('https://example.com/test.mp3');
  });
});
