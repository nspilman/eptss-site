/**
 * Script to set up Supabase storage buckets
 * Run this once to create the required storage buckets
 */

import { createClient } from "@eptss/data-access/utils/supabase/server";
import { BUCKETS } from "./storageService";

export async function setupStorageBuckets() {
  "use server";

  const supabase = await createClient();

  // Create profile-pictures bucket
  const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(
    BUCKETS.PROFILE_PICTURES
  );

  if (checkError || !existingBucket) {
    const { data, error } = await supabase.storage.createBucket(BUCKETS.PROFILE_PICTURES, {
      public: true,
      fileSizeLimit: 5242880, // 5MB in bytes
      allowedMimeTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
    });

    if (error) {
      console.error("Error creating profile-pictures bucket:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Created profile-pictures bucket successfully");
    return { success: true, data };
  }

  console.log("ℹ️  profile-pictures bucket already exists");
  return { success: true, data: existingBucket };
}
