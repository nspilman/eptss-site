# Orphan File Cleanup System

## Overview

This document describes the two-phase commit pattern and automated cleanup system implemented to prevent orphan files in cloud storage when the server crashes between file upload and database insert.

## Problem Statement

Previously, if the server crashed after a file was successfully uploaded to storage but before the database record was created, the file would become an "orphan" - it exists in storage but has no corresponding database entry. This wastes storage space and costs money.

## Solution: Two-Phase Commit Pattern

### How It Works

1. **Upload File** → File is uploaded to cloud storage
2. **Register Pending Upload** → Create a tracking record in `pending_uploads` table
3. **Insert Database Record** → Create the actual submission/entity record
4. **Commit Upload** → Mark the upload as "committed" in tracking table

If step 3 fails, the tracking record remains in "pending" status and will be cleaned up by the automated job.

### Architecture

```
┌─────────────────┐
│   File Upload   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Register Pending Upload │ ← Creates tracking record with expiration
└────────┬────────────────┘
         │
         ▼
┌─────────────────────┐
│  DB Insert (main)   │ ← If this fails, file is orphaned
└────────┬────────────┘
         │
    ┌────┴────┐
    │ Success │ Failure
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Commit  │ │   Fail   │
│ Upload  │ │  Upload  │
└─────────┘ └──────────┘
                │
                ▼
         ┌─────────────┐
         │ Immediate   │
         │ Cleanup     │
         └─────────────┘

┌──────────────────────┐
│   Cron Job (hourly)  │ ← Cleans up any remaining orphans
└──────────────────────┘
```

## Components

### 1. Database Schema (`pending_uploads` table)

**Location:** `packages/data-access/src/db/schema.ts`

```typescript
{
  id: uuid,
  bucket: string,           // Storage bucket name
  filePath: string,         // File path within bucket
  fileUrl: string,          // Public URL
  uploadedBy: uuid,         // User who uploaded
  status: 'pending' | 'committed' | 'failed',
  relatedTable: string,     // e.g., 'submissions'
  relatedId: string,        // Related record ID
  metadata: jsonb,          // Additional context
  createdAt: timestamp,
  committedAt: timestamp,
  expiresAt: timestamp      // Auto-cleanup after this time
}
```

**Migration:** `packages/data-access/src/db/migrations/0053_create_pending_uploads_table.sql`

### 2. Upload Tracking Service

**Location:** `packages/data-access/src/services/uploadTrackingService.ts`

**Key Functions:**
- `registerPendingUpload()` - Create tracking record after file upload
- `commitPendingUpload()` - Mark upload as committed after successful DB insert
- `failPendingUpload()` - Mark upload as failed if DB insert fails
- `getExpiredPendingUploads()` - Get uploads past expiration time

### 3. Cleanup Service

**Location:** `packages/data-access/src/services/orphanFileCleanupService.ts`

**Key Functions:**
- `cleanupExpiredUploads()` - Remove expired pending uploads
- `runComprehensiveCleanup()` - Run full cleanup (expired + old records)
- `getCleanupStats()` - Get cleanup statistics for monitoring

### 4. Submission Service (Updated)

**Location:** `packages/data-access/src/services/submissionService.ts`

The `submitCover()` function now implements the two-phase commit:

```typescript
// Phase 1: Register uploads
const audioUploadId = await registerPendingUpload({...});
const imageUploadId = await registerPendingUpload({...});

// Phase 2: Insert to database
try {
  await db.insert(submissions).values({...});

  // Success: Commit uploads
  await commitPendingUpload(audioUploadId);
  await commitPendingUpload(imageUploadId);
} catch (error) {
  // Failure: Mark as failed and cleanup immediately
  await failPendingUpload(audioUploadId);
  await deleteFile(bucket, filePath);
}
```

### 5. Cleanup Cron Job

**Location:** `apps/web/app/api/cron/cleanup-orphan-files/route.ts`

**Endpoints:**
- `POST /api/cron/cleanup-orphan-files` - Run cleanup job
- `GET /api/cron/cleanup-orphan-files` - Get cleanup statistics

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration to create pending_uploads table
bun run db:migrate
```

### 2. Configure Cron Job

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-orphan-files",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Option B: External Cron Service (e.g., cron-job.org, EasyCron)

- URL: `https://yourdomain.com/api/cron/cleanup-orphan-files`
- Method: POST
- Schedule: `0 */6 * * *` (every 6 hours)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

### 3. Set Environment Variables

Add to `.env`:

```bash
# Optional: Secure your cron endpoint
CRON_SECRET=your-random-secret-here
```

### 4. Update Other File Upload Locations (Optional)

Apply the same pattern to other file upload locations:

```typescript
// Before
const { url } = await uploadFile(bucket, path, file);
await db.insert(table).values({ fileUrl: url });

// After
const { url } = await uploadFile(bucket, path, file);
const uploadId = await registerPendingUpload({...});
try {
  await db.insert(table).values({ fileUrl: url });
  await commitPendingUpload(uploadId);
} catch (error) {
  await failPendingUpload(uploadId);
  await deleteFile(bucket, path);
}
```

## Monitoring

### Check Cleanup Statistics

```bash
curl https://yourdomain.com/api/cron/cleanup-orphan-files
```

Response:
```json
{
  "timestamp": "2025-01-03T10:30:00.000Z",
  "pendingExpiredCount": 5,
  "error": null
}
```

### Manual Cleanup

Trigger cleanup manually:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/cleanup-orphan-files
```

## Configuration Options

### Expiration Time

Files are auto-cleaned after 24 hours by default. To change:

```typescript
await registerPendingUpload({
  // ... other params
  expiresInHours: 48, // 2 days
});
```

### Old Record Retention

Tracking records are kept for 30 days by default. To change:

```typescript
await runComprehensiveCleanup(60); // Keep for 60 days
```

## Testing

### Test Orphan File Creation

1. Upload a file
2. Register pending upload
3. Simulate crash (don't commit)
4. Wait for expiration
5. Run cleanup job
6. Verify file is deleted

### Test Two-Phase Commit

1. Create a submission with files
2. Verify tracking records are created
3. Verify they're marked as committed
4. Verify files remain in storage

## Troubleshooting

### Files Not Being Cleaned Up

**Check:**
1. Is the cron job running? Check logs
2. Are uploads registered correctly? Check `pending_uploads` table
3. Has the expiration time passed?
4. Check cron job authentication

**Debug:**
```sql
-- Check pending uploads
SELECT * FROM pending_uploads
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Check expired uploads
SELECT * FROM pending_uploads
WHERE status = 'pending'
AND expires_at < NOW();
```

### Cron Job Failing

**Check:**
1. Environment variables set correctly
2. Database connection working
3. Storage permissions correct
4. Check application logs

### False Positives (Valid Files Being Deleted)

**Symptoms:** Files being deleted that shouldn't be

**Causes:**
1. `commitPendingUpload()` not being called after successful insert
2. Expiration time too short
3. Clock skew between servers

**Solution:**
1. Verify commit logic in submission service
2. Increase expiration time
3. Review tracking records before cleanup

## Performance Considerations

- **Database Impact:** Minimal - uses indexed queries
- **Storage API Calls:** One list + one delete per orphan file
- **Recommended Schedule:** Every 1-6 hours
- **Expected Load:** < 1 second for < 100 orphan files

## Future Improvements

1. **Dashboard:** Add admin UI to view orphan file statistics
2. **Alerts:** Send notifications when many orphans are detected
3. **Batch Operations:** Optimize for large-scale cleanup
4. **Storage Analysis:** Compare storage vs. database for comprehensive orphan detection
5. **Retry Logic:** Add retries for failed cleanup operations

## Related Files

- Schema: `packages/data-access/src/db/schema.ts:468-491`
- Migration: `packages/data-access/src/db/migrations/0053_create_pending_uploads_table.sql`
- Upload Tracking: `packages/data-access/src/services/uploadTrackingService.ts`
- Cleanup Service: `packages/data-access/src/services/orphanFileCleanupService.ts`
- Submission Service: `packages/data-access/src/services/submissionService.ts:134-282`
- Cron Route: `apps/web/app/api/cron/cleanup-orphan-files/route.ts`
- Storage Service: `packages/bucket-storage/src/storageService.ts`
