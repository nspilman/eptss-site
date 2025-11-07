"use server";

import {
  createUserSocialLink,
  updateUserSocialLink,
  deleteUserSocialLink,
  createUserEmbeddedMedia,
  updateUserEmbeddedMedia,
  deleteUserEmbeddedMedia,
  updateUserProfilePicture,
} from "@eptss/data-access";
import { uploadFile, deleteFile, generateProfilePicturePath, BUCKETS } from "@eptss/bucket-storage";
import { revalidatePath } from "next/cache";
import { Navigation } from "@eptss/shared";
import { logger } from "@eptss/logger/server";

// ============================================
// SOCIAL LINKS ACTIONS
// ============================================

export async function createSocialLinkAction(data: {
  userId: string;
  platform: string;
  label?: string;
  url: string;
  displayOrder?: number;
}) {
  try {
    // Validate inputs
    if (!data.platform || !data.url) {
      return {
        status: "Error" as const,
        message: "Platform and URL are required",
      };
    }

    if (data.url.length > 500) {
      return {
        status: "Error" as const,
        message: "URL must be less than 500 characters",
      };
    }

    if (data.label && data.label.length > 100) {
      return {
        status: "Error" as const,
        message: "Label must be less than 100 characters",
      };
    }

    // Validate URL format
    try {
      new URL(data.url);
    } catch {
      return {
        status: "Error" as const,
        message: "Invalid URL format",
      };
    }

    const newLink = await createUserSocialLink({
      userId: data.userId,
      platform: data.platform.trim(),
      label: data.label?.trim() || null,
      url: data.url.trim(),
      displayOrder: data.displayOrder ?? 0,
    });

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Social link created", { userId: data.userId, linkId: newLink.id });

    return {
      status: "Success" as const,
      message: "Social link added successfully",
      data: newLink,
    };
  } catch (error) {
    logger.error("Create social link error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
    });

    return {
      status: "Error" as const,
      message: "Failed to create social link. Please try again.",
    };
  }
}

export async function updateSocialLinkAction(data: {
  linkId: string;
  userId: string;
  platform?: string;
  label?: string;
  url?: string;
  displayOrder?: number;
}) {
  try {
    if (!data.linkId) {
      return {
        status: "Error" as const,
        message: "Link ID is required",
      };
    }

    if (data.url && data.url.length > 500) {
      return {
        status: "Error" as const,
        message: "URL must be less than 500 characters",
      };
    }

    if (data.label && data.label.length > 100) {
      return {
        status: "Error" as const,
        message: "Label must be less than 100 characters",
      };
    }

    // Validate URL format if provided
    if (data.url) {
      try {
        new URL(data.url);
      } catch {
        return {
          status: "Error" as const,
          message: "Invalid URL format",
        };
      }
    }

    const updateData: {
      platform?: string;
      label?: string | null;
      url?: string;
      displayOrder?: number;
    } = {};

    if (data.platform !== undefined) updateData.platform = data.platform.trim();
    if (data.label !== undefined) updateData.label = data.label?.trim() || null;
    if (data.url !== undefined) updateData.url = data.url.trim();
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const updatedLink = await updateUserSocialLink(data.linkId, updateData);

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Social link updated", { userId: data.userId, linkId: data.linkId });

    return {
      status: "Success" as const,
      message: "Social link updated successfully",
      data: updatedLink,
    };
  } catch (error) {
    logger.error("Update social link error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
      linkId: data.linkId,
    });

    return {
      status: "Error" as const,
      message: "Failed to update social link. Please try again.",
    };
  }
}

export async function deleteSocialLinkAction(data: {
  linkId: string;
  userId: string;
}) {
  try {
    if (!data.linkId) {
      return {
        status: "Error" as const,
        message: "Link ID is required",
      };
    }

    await deleteUserSocialLink(data.linkId);

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Social link deleted", { userId: data.userId, linkId: data.linkId });

    return {
      status: "Success" as const,
      message: "Social link deleted successfully",
    };
  } catch (error) {
    logger.error("Delete social link error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
      linkId: data.linkId,
    });

    return {
      status: "Error" as const,
      message: "Failed to delete social link. Please try again.",
    };
  }
}

// ============================================
// EMBEDDED MEDIA ACTIONS
// ============================================

export async function createEmbeddedMediaAction(data: {
  userId: string;
  mediaType: "audio" | "video" | "image" | "embed";
  embedCode: string;
  title?: string;
  displayOrder?: number;
}) {
  try {
    // Validate inputs
    if (!data.mediaType || !data.embedCode) {
      return {
        status: "Error" as const,
        message: "Media type and embed code are required",
      };
    }

    const validMediaTypes = ["audio", "video", "image", "embed"];
    if (!validMediaTypes.includes(data.mediaType)) {
      return {
        status: "Error" as const,
        message: "Invalid media type. Must be audio, video, image, or embed",
      };
    }

    if (data.embedCode.length > 5000) {
      return {
        status: "Error" as const,
        message: "Embed code must be less than 5000 characters",
      };
    }

    if (data.title && data.title.length > 200) {
      return {
        status: "Error" as const,
        message: "Title must be less than 200 characters",
      };
    }

    const newMedia = await createUserEmbeddedMedia({
      userId: data.userId,
      mediaType: data.mediaType,
      embedCode: data.embedCode.trim(),
      title: data.title?.trim() || null,
      displayOrder: data.displayOrder ?? 0,
    });

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Embedded media created", { userId: data.userId, mediaId: newMedia.id });

    return {
      status: "Success" as const,
      message: "Embedded media added successfully",
      data: newMedia,
    };
  } catch (error) {
    logger.error("Create embedded media error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
    });

    return {
      status: "Error" as const,
      message: "Failed to create embedded media. Please try again.",
    };
  }
}

export async function updateEmbeddedMediaAction(data: {
  mediaId: string;
  userId: string;
  mediaType?: "audio" | "video" | "image" | "embed";
  embedCode?: string;
  title?: string;
  displayOrder?: number;
}) {
  try {
    if (!data.mediaId) {
      return {
        status: "Error" as const,
        message: "Media ID is required",
      };
    }

    if (data.mediaType) {
      const validMediaTypes = ["audio", "video", "image", "embed"];
      if (!validMediaTypes.includes(data.mediaType)) {
        return {
          status: "Error" as const,
          message: "Invalid media type. Must be audio, video, image, or embed",
        };
      }
    }

    if (data.embedCode && data.embedCode.length > 5000) {
      return {
        status: "Error" as const,
        message: "Embed code must be less than 5000 characters",
      };
    }

    if (data.title && data.title.length > 200) {
      return {
        status: "Error" as const,
        message: "Title must be less than 200 characters",
      };
    }

    const updateData: {
      mediaType?: "audio" | "video" | "image" | "embed";
      embedCode?: string;
      title?: string | null;
      displayOrder?: number;
    } = {};

    if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
    if (data.embedCode !== undefined) updateData.embedCode = data.embedCode.trim();
    if (data.title !== undefined) updateData.title = data.title?.trim() || null;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const updatedMedia = await updateUserEmbeddedMedia(data.mediaId, updateData);

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Embedded media updated", { userId: data.userId, mediaId: data.mediaId });

    return {
      status: "Success" as const,
      message: "Embedded media updated successfully",
      data: updatedMedia,
    };
  } catch (error) {
    logger.error("Update embedded media error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
      mediaId: data.mediaId,
    });

    return {
      status: "Error" as const,
      message: "Failed to update embedded media. Please try again.",
    };
  }
}

export async function deleteEmbeddedMediaAction(data: {
  mediaId: string;
  userId: string;
}) {
  try {
    if (!data.mediaId) {
      return {
        status: "Error" as const,
        message: "Media ID is required",
      };
    }

    await deleteUserEmbeddedMedia(data.mediaId);

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Embedded media deleted", { userId: data.userId, mediaId: data.mediaId });

    return {
      status: "Success" as const,
      message: "Embedded media deleted successfully",
    };
  } catch (error) {
    logger.error("Delete embedded media error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
      mediaId: data.mediaId,
    });

    return {
      status: "Error" as const,
      message: "Failed to delete embedded media. Please try again.",
    };
  }
}

// ============================================
// PROFILE PICTURE ACTIONS
// ============================================

export async function uploadProfilePictureAction(data: {
  userId: string;
  file: File;
  oldProfilePictureUrl?: string | null;
}): Promise<{ status: "Success" | "Error"; message: string; url?: string }> {
  try {
    // Validate file
    if (!data.file) {
      return {
        status: "Error" as const,
        message: "File is required",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(data.file.type)) {
      return {
        status: "Error" as const,
        message: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (data.file.size > maxSize) {
      return {
        status: "Error" as const,
        message: "File size must be less than 5MB",
      };
    }

    // Generate unique file path
    const filePath = generateProfilePicturePath(data.userId, data.file.name);

    // Upload to storage
    const { url, error: uploadError } = await uploadFile(
      BUCKETS.PROFILE_PICTURES,
      filePath,
      data.file,
      {
        upsert: false,
        contentType: data.file.type,
      }
    );

    if (uploadError || !url) {
      logger.error("Profile picture upload error", {
        error: uploadError,
        userId: data.userId,
      });
      return {
        status: "Error" as const,
        message: uploadError || "Failed to upload profile picture",
      };
    }

    // Update user record with new profile picture URL
    await updateUserProfilePicture(data.userId, url);

    // Delete old profile picture if it exists
    if (data.oldProfilePictureUrl) {
      try {
        // Extract path from URL
        const urlObj = new URL(data.oldProfilePictureUrl);
        const pathMatch = urlObj.pathname.match(/\/profile-pictures\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          await deleteFile(BUCKETS.PROFILE_PICTURES, pathMatch[1]);
        }
      } catch (deleteError) {
        // Log but don't fail the operation if old file deletion fails
        logger.warn("Failed to delete old profile picture", {
          error: deleteError instanceof Error ? deleteError.message : "Unknown error",
          userId: data.userId,
          oldUrl: data.oldProfilePictureUrl,
        });
      }
    }

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Profile picture uploaded", { userId: data.userId, url });

    return {
      status: "Success" as const,
      message: "Profile picture uploaded successfully",
      url,
    };
  } catch (error) {
    logger.error("Upload profile picture error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
    });

    return {
      status: "Error" as const,
      message: "Failed to upload profile picture. Please try again.",
    };
  }
}

export async function deleteProfilePictureAction(data: {
  userId: string;
  profilePictureUrl: string;
}): Promise<{ status: "Success" | "Error"; message: string }> {
  try {
    if (!data.profilePictureUrl) {
      return {
        status: "Error" as const,
        message: "Profile picture URL is required",
      };
    }

    // Extract path from URL
    const urlObj = new URL(data.profilePictureUrl);
    const pathMatch = urlObj.pathname.match(/\/profile-pictures\/(.+)$/);

    if (!pathMatch || !pathMatch[1]) {
      return {
        status: "Error" as const,
        message: "Invalid profile picture URL",
      };
    }

    const filePath = pathMatch[1];

    // Delete from storage
    const { success, error: deleteError } = await deleteFile(BUCKETS.PROFILE_PICTURES, filePath);

    if (!success) {
      logger.error("Profile picture delete error", {
        error: deleteError,
        userId: data.userId,
      });
      return {
        status: "Error" as const,
        message: deleteError || "Failed to delete profile picture",
      };
    }

    // Update user record to remove profile picture URL
    await updateUserProfilePicture(data.userId, null);

    revalidatePath(Navigation.Profile);
    revalidatePath(`/profile/${data.userId}`);

    logger.info("Profile picture deleted", { userId: data.userId });

    return {
      status: "Success" as const,
      message: "Profile picture deleted successfully",
    };
  } catch (error) {
    logger.error("Delete profile picture error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: data.userId,
    });

    return {
      status: "Error" as const,
      message: "Failed to delete profile picture. Please try again.",
    };
  }
}
