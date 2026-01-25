/**
 * Human-friendly field labels for form validation and error messages
 * Shared across submission forms, signup forms, and validation logic
 */
export const FIELD_LABELS: Record<string, string> = {
  // Audio submission fields
  audioFileUrl: 'Audio File',
  audioFilePath: 'Audio File',
  coverImageUrl: 'Cover Image',
  coverImagePath: 'Cover Image',
  audioDuration: 'Audio Duration',
  audioFileSize: 'Audio File Size',

  // Submission reflection fields
  coolThingsLearned: 'Cool Things Learned',
  toolsUsed: 'Tools Used',
  happyAccidents: 'Happy Accidents',
  didntWork: "What Didn't Work",

  // Round and identification fields
  roundId: 'Round ID',

  // User fields
  email: 'Email',

  // Song fields
  songTitle: 'Song Title',
  artist: 'Artist',
  youtubeLink: 'YouTube Link',
  soundcloudUrl: 'SoundCloud URL',

  // Additional fields
  additionalComments: 'Additional Comments',
} as const;

/**
 * Helper function to get a human-friendly label for a field name
 * Falls back to a formatted version of the field name if not found in the mapping
 *
 * @param fieldName - The camelCase field name
 * @returns A human-friendly label
 *
 * @example
 * ```typescript
 * getFieldLabel('audioFileUrl') // => 'Audio File'
 * getFieldLabel('customField') // => 'Custom Field'
 * ```
 */
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}
