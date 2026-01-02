/**
 * Chunked upload utilities for large files
 */

import type { ChunkedUploadOptions } from '../types';

/**
 * Default chunk size (5MB)
 */
const DEFAULT_CHUNK_SIZE_MB = 5;

/**
 * Default max concurrent chunks
 */
const DEFAULT_MAX_CONCURRENT = 3;

/**
 * Split a file into chunks
 */
export function createFileChunks(file: File, chunkSizeMB: number = DEFAULT_CHUNK_SIZE_MB): Blob[] {
  const chunkSize = chunkSizeMB * 1024 * 1024; // Convert to bytes
  const chunks: Blob[] = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }

  return chunks;
}

/**
 * Upload a file in chunks with progress tracking
 * Note: This is a simplified implementation. In production, you'd want to use
 * Supabase's resumable upload API or implement a custom chunking strategy.
 */
export async function uploadFileInChunks(
  file: File,
  uploadFn: (chunk: Blob, index: number, total: number) => Promise<void>,
  options: ChunkedUploadOptions = {}
): Promise<void> {
  const {
    chunkSizeMB = DEFAULT_CHUNK_SIZE_MB,
    maxConcurrentChunks = DEFAULT_MAX_CONCURRENT,
    onProgress,
  } = options;

  const chunks = createFileChunks(file, chunkSizeMB);
  const totalChunks = chunks.length;

  // If file is small enough, upload as single chunk
  if (totalChunks === 1) {
    await uploadFn(chunks[0], 0, 1);
    onProgress?.(100);
    return;
  }

  let uploadedChunks = 0;
  let currentIndex = 0;

  // Upload chunks with concurrency control
  const uploadNextChunk = async (): Promise<void> => {
    if (currentIndex >= totalChunks) return;

    const index = currentIndex++;
    const chunk = chunks[index];

    try {
      await uploadFn(chunk, index, totalChunks);
      uploadedChunks++;

      // Calculate and report progress
      const progress = (uploadedChunks / totalChunks) * 100;
      onProgress?.(progress);

      // Upload next chunk
      await uploadNextChunk();
    } catch (error) {
      console.error(`Failed to upload chunk ${index}:`, error);
      throw error;
    }
  };

  // Start concurrent uploads
  const concurrentUploads = Math.min(maxConcurrentChunks, totalChunks);
  const uploadPromises: Promise<void>[] = [];

  for (let i = 0; i < concurrentUploads; i++) {
    uploadPromises.push(uploadNextChunk());
  }

  await Promise.all(uploadPromises);
}

/**
 * Check if a file should be uploaded in chunks
 */
export function shouldUseChunkedUpload(file: File, thresholdMB: number = 10): boolean {
  const thresholdBytes = thresholdMB * 1024 * 1024;
  return file.size > thresholdBytes;
}

/**
 * Calculate optimal chunk size based on file size
 */
export function calculateOptimalChunkSize(file: File): number {
  const fileSizeMB = file.size / (1024 * 1024);

  // Small files (< 50MB): 5MB chunks
  if (fileSizeMB < 50) return 5;

  // Medium files (50-200MB): 10MB chunks
  if (fileSizeMB < 200) return 10;

  // Large files (> 200MB): 20MB chunks
  return 20;
}
