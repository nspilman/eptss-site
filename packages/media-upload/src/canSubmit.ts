/**
 * Pure validation function for checking if form can be submitted
 * Based on upload states and form configuration
 * No side effects - easily testable
 */

import type { UploadState } from './uploadReducer';

export interface UploadStates {
  audio: UploadState;
  image: UploadState;
}

export interface SubmitConfig {
  audioRequired: boolean;
  imageRequired: boolean;
  /** If true, at least one of audio OR lyrics must be provided */
  audioOrLyricsRequired: boolean;
}

export interface CanSubmitResult {
  allowed: boolean;
  errors: string[];
  /** Which uploads are still in progress */
  pending: ('audio' | 'image')[];
}

/**
 * Check if the form can be submitted based on upload states and config
 *
 * @param uploads - Current state of audio and image uploads
 * @param config - What's required for submission
 * @param hasLyrics - Whether lyrics text field has content (for audio-or-lyrics logic)
 * @returns Whether submission is allowed and any blocking errors
 */
export function canSubmit(
  uploads: UploadStates,
  config: SubmitConfig,
  hasLyrics: boolean = false
): CanSubmitResult {
  const errors: string[] = [];
  const pending: ('audio' | 'image')[] = [];

  // Check for uploads in progress
  if (uploads.audio.status === 'uploading') {
    pending.push('audio');
  }
  if (uploads.image.status === 'uploading') {
    pending.push('image');
  }

  // Can't submit while uploads are in progress
  if (pending.length > 0) {
    return {
      allowed: false,
      errors: ['Please wait for uploads to complete'],
      pending,
    };
  }

  // Check audio requirement - show specific error if upload failed, generic if not attempted
  if (config.audioRequired && uploads.audio.status !== 'complete') {
    if (uploads.audio.status === 'error') {
      errors.push(`Audio upload failed: ${uploads.audio.error || 'Unknown error'}`);
    } else {
      errors.push('Audio file is required');
    }
  }

  // Check image requirement - show specific error if upload failed, generic if not attempted
  if (config.imageRequired && uploads.image.status !== 'complete') {
    if (uploads.image.status === 'error') {
      errors.push(`Image upload failed: ${uploads.image.error || 'Unknown error'}`);
    } else {
      errors.push('Cover image is required');
    }
  }

  // Check audio-or-lyrics requirement (at least one must be provided)
  if (config.audioOrLyricsRequired) {
    const hasAudio = uploads.audio.status === 'complete';
    if (!hasAudio && !hasLyrics) {
      if (uploads.audio.status === 'error') {
        errors.push(`Audio upload failed: ${uploads.audio.error || 'Unknown error'}`);
      } else {
        errors.push('Please provide either an audio file or lyrics');
      }
    }
  }

  return {
    allowed: errors.length === 0,
    errors,
    pending,
  };
}

/**
 * Helper to derive submit config from SubmissionFormConfig
 * Keeps the translation logic in one place
 */
export function deriveSubmitConfig(formConfig: {
  fields: {
    audioFile: { required?: boolean; requiredGroup?: string; enabled?: boolean };
    coverImage: { required?: boolean; enabled?: boolean };
    lyrics?: { enabled?: boolean; requiredGroup?: string };
  };
}): SubmitConfig {
  const audioConfig = formConfig.fields.audioFile;
  const imageConfig = formConfig.fields.coverImage;
  const lyricsConfig = formConfig.fields.lyrics;

  // Check if audio and lyrics share a required group (meaning one OR the other is needed)
  const audioOrLyricsRequired = Boolean(
    audioConfig.requiredGroup &&
    lyricsConfig?.requiredGroup &&
    audioConfig.requiredGroup === lyricsConfig.requiredGroup
  );

  // Audio is required if explicitly required, OR if it's in a required group but lyrics is disabled
  const audioRequiredExplicitly = audioConfig.required === true;
  const audioRequiredByGroup = Boolean(audioConfig.requiredGroup && !lyricsConfig?.enabled);
  const audioRequired = (audioRequiredExplicitly || audioRequiredByGroup) && !audioOrLyricsRequired;

  return {
    audioRequired,
    imageRequired: imageConfig.required === true,
    audioOrLyricsRequired,
  };
}
