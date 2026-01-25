"use server";

import { getUserSocialLinks, getUserEmbeddedMedia } from "../../services/userService";

interface ProfileProviderProps {
  userId: string;
}

/**
 * Provider for fetching user profile data including social links and embedded media
 */
export const profileProvider = async ({ userId }: ProfileProviderProps) => {
  try {
    const [socialLinks, embeddedMedia] = await Promise.all([
      getUserSocialLinks(userId),
      getUserEmbeddedMedia(userId),
    ]);

    return {
      socialLinks,
      embeddedMedia,
    };
  } catch (error) {
    console.error("Error in profileProvider:", error);
    return {
      socialLinks: [],
      embeddedMedia: [],
    };
  }
};

/**
 * Fetch only social links for a user
 */
export async function getUserSocialLinksProvider(userId: string) {
  try {
    return await getUserSocialLinks(userId);
  } catch (error) {
    console.error("Error fetching user social links:", error);
    return [];
  }
}

/**
 * Fetch only embedded media for a user
 */
export async function getUserEmbeddedMediaProvider(userId: string) {
  try {
    return await getUserEmbeddedMedia(userId);
  } catch (error) {
    console.error("Error fetching user embedded media:", error);
    return [];
  }
}
