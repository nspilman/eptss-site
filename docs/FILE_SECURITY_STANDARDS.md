# File Upload Security Standards

## Overview

This document establishes security standards for file uploads and storage to protect against common vulnerabilities including:
- Malicious file uploads
- DoS attacks via large or long files
- Unauthorized file access
- File type spoofing

## Server-Side Validation

### ✅ Always Validate on Server

**Never trust client-side validation alone.** Attackers can bypass client-side checks.

```typescript
import { uploadFile, BUCKETS } from '@eptss/bucket-storage';

// ✅ GOOD - Server validates automatically
await uploadFile(
  BUCKETS.AUDIO_SUBMISSIONS,
  'user-123/audio.mp3',
  file,
  {
    audioDuration: 180.5, // Validation checks this doesn't exceed limits
  }
);
```

**The uploadFile function now includes:**
1. **MIME Type Verification** - Checks the file's reported MIME type
2. **Magic Number Validation** - Reads file header bytes to verify actual content
3. **File Size Limits** - Enforces maximum file sizes per bucket type
4. **Duration Limits** - For audio files, validates duration doesn't exceed limits

### Validation Implementation

**Location**: `packages/data-access/src/utils/serverFileValidation.ts`

#### Audio File Validation

```typescript
import { validateAudioFile } from '@eptss/data-access/utils/serverFileValidation';

const validation = await validateAudioFile(file, {
  maxDurationSeconds: 1800, // 30 minutes (default)
  maxFileSizeBytes: 52428800, // 50 MB (default)
  providedDuration: 180.5, // Duration from client (in seconds)
});

if (!validation.valid) {
  console.error('Validation failed:', validation.error);
  return;
}
```

**Checks Performed:**
- File size ≤ 50 MB (configurable)
- MIME type in allowed list: `audio/mpeg`, `audio/wav`, `audio/flac`, `audio/ogg`, `audio/opus`, `audio/mp4`, `audio/x-m4a`, `audio/aiff`
- Magic number matches audio format (reads first 12 bytes)
- Duration ≤ 30 minutes (configurable, if provided)
- Duration > 0 (if provided)

#### Image File Validation

```typescript
import { validateImageFile } from '@eptss/data-access/utils/serverFileValidation';

const validation = await validateImageFile(file, {
  maxFileSizeBytes: 5242880, // 5 MB (default)
});

if (!validation.valid) {
  console.error('Validation failed:', validation.error);
  return;
}
```

**Checks Performed:**
- File size ≤ 5 MB (configurable)
- MIME type in allowed list: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Magic number matches image format

### Magic Numbers Reference

Magic numbers (file signatures) prevent file type spoofing:

**Audio Formats:**
```typescript
// MP3: 0xFF 0xFB or 0x49 0x44 0x33 (ID3)
// WAV: 0x52 0x49 0x46 0x46 ("RIFF")
// FLAC: 0x66 0x4C 0x61 0x43 ("fLaC")
// OGG: 0x4F 0x67 0x67 0x53 ("OggS")
```

**Image Formats:**
```typescript
// JPEG: 0xFF 0xD8 0xFF
// PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
// GIF: 0x47 0x49 0x46 0x38 ("GIF8")
// WebP: 0x52 0x49 0x46 0x46 ("RIFF") + "WEBP" at offset 8
```

## DoS Protection

### File Size Limits

**Configured per bucket type:**

```typescript
// In serverFileValidation.ts
export const MAX_AUDIO_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB
```

**Why:**
- Prevents storage exhaustion
- Prevents bandwidth abuse
- Ensures reasonable processing times

### Audio Duration Limits

**Maximum duration: 30 minutes**

```typescript
export const MAX_AUDIO_DURATION_SECONDS = 30 * 60; // 30 minutes
```

**Why:**
- Prevents processing of extremely long files
- Limits storage consumption
- Reasonable for intended use case (song submissions)

**Enforcement:**
```typescript
await uploadFile(
  BUCKETS.AUDIO_SUBMISSIONS,
  path,
  file,
  {
    audioDuration: durationInSeconds, // Validated against MAX_AUDIO_DURATION_SECONDS
  }
);
```

## Access Control

### Problem: Public URLs

**❌ Security Issue:**
```typescript
// OLD APPROACH - Files are publicly accessible forever
const { data } = supabase.storage.from(bucket).getPublicUrl(path);
// Anyone with this URL can access the file indefinitely
```

**Issues:**
1. URLs never expire
2. No authentication required
3. Cannot be revoked
4. Can be shared/leaked

### Solution: Signed URLs

**✅ Recommended Approach:**

```typescript
import { getSignedUrl } from '@eptss/bucket-storage';

// Generate signed URL with 1 hour expiration (default)
const { url, error, expiresAt } = await getSignedUrl(
  BUCKETS.AUDIO_SUBMISSIONS,
  'user-123/audio.mp3',
  {
    expiresIn: 3600, // 1 hour in seconds
    download: false, // Display inline (or true/filename for download)
  }
);

if (error) {
  console.error('Failed to generate signed URL:', error);
  return;
}

// Use the URL (valid for 1 hour)
console.log('URL expires at:', expiresAt);
```

**Benefits:**
- ✅ Requires authentication to generate
- ✅ Expires after set time (default 1 hour)
- ✅ Can be regenerated if needed
- ✅ Reduces risk of permanent exposure

### Batch Signed URLs

For listing multiple files:

```typescript
import { getSignedUrls } from '@eptss/bucket-storage';

const paths = [
  'user-123/audio1.mp3',
  'user-123/audio2.mp3',
  'user-123/audio3.mp3',
];

const results = await getSignedUrls(
  BUCKETS.AUDIO_SUBMISSIONS,
  paths,
  { expiresIn: 7200 } // 2 hours
);

// Process results
results.forEach(({ path, url, error, expiresAt }) => {
  if (url) {
    console.log(`${path}: ${url} (expires ${expiresAt})`);
  } else {
    console.error(`${path}: ${error}`);
  }
});
```

### When to Use Public URLs

**Only use `getPublicUrl` for:**
- Truly public content (logos, public images)
- Content that should remain accessible indefinitely
- Non-sensitive data

**Mark as deprecated:**
```typescript
/**
 * @deprecated Use getSignedUrl for better security
 */
export async function getPublicUrl(...) { ... }
```

### Design Decision: Public URLs for Music Submissions

**Current Implementation:**
The EPTSS platform currently uses **public URLs** for audio submissions and cover images, not signed URLs. This is an intentional design decision based on the platform's use case.

**Why Public URLs for This Use Case:**

1. **Public Community Platform**
   - Music submissions are intended to be shared publicly
   - Users expect their submissions to be accessible to the community
   - No privacy concerns for submitted content

2. **Long-Term Accessibility**
   - Submissions should remain accessible across voting periods
   - Public URLs don't expire, avoiding broken links
   - Reduces complexity for playback in various contexts

3. **Performance & Simplicity**
   - No need to regenerate URLs before playback
   - Direct file access without server round-trips
   - Simpler architecture for public content

4. **Supabase RLS Policies Provide Access Control**
   - Row-Level Security (RLS) policies control who can upload
   - File paths include user IDs for organization
   - Bucket policies restrict uploads to authenticated users

**Implementation:**
```typescript
// In uploadFile() - returns public URL
const { data: publicUrlData } = supabase.storage
  .from(bucket)
  .getPublicUrl(data.path);

return { url: publicUrlData.publicUrl, error: null };
```

**When to Switch to Signed URLs:**

Consider using signed URLs for future features requiring:
- **Private content** (draft submissions, admin-only files)
- **Temporary access** (download links, time-limited previews)
- **Sensitive data** (user documents, personal information)
- **Paid content** (premium features, downloadable content)

**Example Use Cases for Each:**

```typescript
// PUBLIC URL - Music submissions (current)
const { url } = await uploadFile(
  BUCKETS.AUDIO_SUBMISSIONS,
  `${userId}/${timestamp}-track.mp3`,
  audioFile,
  { audioDuration: 180 }
);
// Returns: https://xxx.supabase.co/storage/v1/object/public/audio-submissions/...
// Accessible by anyone with the link, forever

// SIGNED URL - Private admin reports (future feature)
const { url, expiresAt } = await getSignedUrl(
  BUCKETS.ADMIN_REPORTS,
  `reports/2024-01-financial.pdf`,
  { expiresIn: 3600 } // 1 hour
);
// Returns: https://xxx.supabase.co/storage/v1/object/sign/...?token=...
// Accessible only for 1 hour, requires auth to generate
```

## Upload Flow with Security

### Complete Secure Upload Flow

```typescript
import { uploadFile, BUCKETS } from '@eptss/bucket-storage';

async function handleAudioUpload(file: File, duration: number) {
  // 1. Upload with server-side validation
  const { url, error } = await uploadFile(
    BUCKETS.AUDIO_SUBMISSIONS,
    `${userId}/${timestamp}-${file.name}`,
    file,
    {
      audioDuration: duration, // Validated server-side
      contentType: file.type,
    }
  );

  if (error) {
    // Validation or upload failed
    return { success: false, error };
  }

  // 2. Store in database
  await db.insert(submissions).values({
    audioFileUrl: url,
    audioFilePath: path,
    audioDuration: secondsToMilliseconds(duration), // Store in milliseconds
    userId,
  });

  // 3. Generate signed URL for immediate playback
  const { url: playbackUrl, expiresAt } = await getSignedUrl(
    BUCKETS.AUDIO_SUBMISSIONS,
    path,
    { expiresIn: 3600 }
  );

  return { success: true, url: playbackUrl, expiresAt };
}
```

**What happens:**
1. File uploaded with automatic validation:
   - MIME type checked
   - Magic number verified
   - File size checked
   - Duration validated (≤ 30 minutes)
2. Public URL returned (for DB storage)
3. Signed URL generated for client playback (expires in 1 hour)

## Configuration

### Environment Variables

```bash
# .env.local

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# File Upload Limits (optional overrides)
MAX_AUDIO_DURATION_SECONDS=1800  # 30 minutes
MAX_AUDIO_FILE_SIZE_MB=50
MAX_IMAGE_FILE_SIZE_MB=5
```

### Supabase Bucket Policies

**Recommended RLS policies:**

```sql
-- Audio Submissions Bucket
-- Policy 1: Authenticated users can upload their own files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own files
CREATE POLICY "Users can read their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Submission Images Bucket
CREATE POLICY "Users can upload their own cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submission-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own cover images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Security Checklist

Before deploying file upload features:

- [ ] Server-side validation enabled (MIME + magic number)
- [ ] File size limits enforced
- [ ] Audio duration limits enforced
- [ ] Using signed URLs instead of public URLs (where appropriate)
- [ ] Supabase RLS policies configured
- [ ] File paths include user ID for access control
- [ ] Error messages don't leak sensitive information
- [ ] Logging configured for security events
- [ ] Rate limiting configured (if applicable)
- [ ] Malware scanning (if applicable)

## Common Vulnerabilities

### ❌ Trusting File Extensions

```typescript
// BAD - Can be spoofed
if (file.name.endsWith('.mp3')) {
  // Upload as audio
}
```

**Fix:** Use magic number validation (built into `uploadFile`)

### ❌ Trusting MIME Type Alone

```typescript
// BAD - Can be spoofed in request
if (file.type === 'audio/mpeg') {
  // Upload
}
```

**Fix:** Validate both MIME type AND magic number (built into `uploadFile`)

### ❌ No File Size Limits

```typescript
// BAD - Can cause DoS
await uploadFile(bucket, path, file); // No size check
```

**Fix:** Enforce limits (built into `uploadFile`)

### ❌ No Duration Limits for Audio

```typescript
// BAD - Can upload 10-hour files
await uploadFile(bucket, path, file, {
  // No duration validation
});
```

**Fix:** Pass `audioDuration` for validation

### ❌ Public URLs for Sensitive Files

```typescript
// BAD - URLs never expire
const url = await getPublicUrl(bucket, path);
```

**Fix:** Use signed URLs with expiration

## Testing Security

### Test Cases

```typescript
// 1. Test file type spoofing
const fakeAudio = new File(
  [new Uint8Array([0xFF, 0xD8, 0xFF])], // JPEG magic number
  'fake.mp3',
  { type: 'audio/mpeg' } // Claims to be MP3
);
// Should FAIL validation (magic number doesn't match MIME type)

// 2. Test file size limit
const largeFil = new File(
  [new Uint8Array(100 * 1024 * 1024)], // 100 MB
  'large.mp3',
  { type: 'audio/mpeg' }
);
// Should FAIL validation (exceeds 50 MB limit)

// 3. Test duration limit
await uploadFile(bucket, path, validAudioFile, {
  audioDuration: 2000, // 33.3 minutes
});
// Should FAIL validation (exceeds 30 minute limit)

// 4. Test signed URL expiration
const { url, expiresAt } = await getSignedUrl(bucket, path, {
  expiresIn: 60, // 1 minute
});
// Wait 2 minutes, then try to access URL
// Should FAIL with 403 Forbidden
```

## Migration Guide

### From Public URLs to Signed URLs

**Step 1: Identify Current Usage**
```bash
grep -r "getPublicUrl" packages/
```

**Step 2: Replace with Signed URLs**
```typescript
// OLD
const url = await getPublicUrl(BUCKETS.AUDIO_SUBMISSIONS, path);

// NEW
const { url, error } = await getSignedUrl(
  BUCKETS.AUDIO_SUBMISSIONS,
  path,
  { expiresIn: 3600 }
);
```

**Step 3: Update Client Code**
- Refresh signed URLs before expiration
- Handle expiration gracefully
- Request new signed URL when needed

**Step 4: Update Database (Optional)**
- Store public URL for reference
- Generate signed URL on-demand when serving to client
- Don't store signed URLs (they expire)

## Related Documentation

- [Code Quality Standards](./CODE_QUALITY_STANDARDS.md)
- [Orphan File Cleanup](./ORPHAN_FILE_CLEANUP.md)
- [Audio Duration Storage](./AUDIO_DURATION_STORAGE.md)
- [Schema Validation Standards](./SCHEMA_VALIDATION_STANDARDS.md)

## References

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [File Signatures (Magic Numbers)](https://en.wikipedia.org/wiki/List_of_file_signatures)
