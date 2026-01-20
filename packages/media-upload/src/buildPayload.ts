/**
 * Pure function to build submission payload from upload states and form values
 * No side effects - easily testable
 */

import type { UploadState } from './uploadReducer';

export interface UploadStates {
  audio: UploadState;
  image: UploadState;
}

export interface TextFields {
  lyrics?: string;
  coolThingsLearned?: string;
  toolsUsed?: string;
  happyAccidents?: string;
  didntWork?: string;
}

export interface SubmissionPayload {
  roundId: number;
  // Audio fields
  audioFileUrl: string;
  audioFilePath: string;
  audioFileSize?: number;
  audioDuration?: number;
  // Image fields
  coverImageUrl: string;
  coverImagePath: string;
  // Text fields
  lyrics: string;
  coolThingsLearned: string;
  toolsUsed: string;
  happyAccidents: string;
  didntWork: string;
}

/**
 * Build a submission payload from upload states and text field values
 *
 * @param roundId - The round ID for this submission
 * @param uploads - Current state of audio and image uploads
 * @param textFields - Values from text input fields
 * @returns Complete submission payload ready for server action
 */
export function buildPayload(
  roundId: number,
  uploads: UploadStates,
  textFields: TextFields
): SubmissionPayload {
  const audioResult = uploads.audio.result;
  const imageResult = uploads.image.result;

  return {
    roundId,

    // Audio fields - only populated if upload complete
    audioFileUrl: audioResult?.url ?? '',
    audioFilePath: audioResult?.path ?? '',
    audioFileSize: audioResult?.fileSize,
    audioDuration: audioResult?.metadata?.audio
      ? (audioResult.metadata.audio as { duration?: number }).duration
      : undefined,

    // Image fields - only populated if upload complete
    coverImageUrl: imageResult?.url ?? '',
    coverImagePath: imageResult?.path ?? '',

    // Text fields - pass through with defaults
    lyrics: textFields.lyrics ?? '',
    coolThingsLearned: textFields.coolThingsLearned ?? '',
    toolsUsed: textFields.toolsUsed ?? '',
    happyAccidents: textFields.happyAccidents ?? '',
    didntWork: textFields.didntWork ?? '',
  };
}

/**
 * Convert payload to FormData for server action
 * Filters out empty/undefined values
 */
export function payloadToFormData(payload: SubmissionPayload): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  }

  return formData;
}
