import { getPublicProfileByUsername, getPublicReflectionsByUsername } from "@eptss/data-access";
import { PublicProfile } from "./PublicProfile";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUsername } from "@eptss/auth/server";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profileData = await getPublicProfileByUsername(username);

  if (!profileData) {
    return {
      title: "User Not Found | Everyone Plays the Same Song",
    };
  }

  const displayName = profileData.user.displayName;

  return {
    title: `${displayName} | Everyone Plays the Same Song`,
    description: `View ${displayName}'s profile, submissions, and reflections on Everyone Plays the Same Song.`,
    openGraph: {
      title: `${displayName} | Everyone Plays the Same Song`,
      description: `View ${displayName}'s profile, submissions, and reflections on Everyone Plays the Same Song.`,
    },
  };
}

const PublicProfilePage = async ({ params }: Props) => {
  const { username } = await params;

  // Check if viewing own profile
  const currentUsername = await getCurrentUsername();
  const isOwnProfile = currentUsername === username;

  // Fetch profile data and reflections in parallel
  const [profileData, reflectionsResult] = await Promise.all([
    getPublicProfileByUsername(username),
    getPublicReflectionsByUsername(username),
  ]);

  if (!profileData) {
    notFound();
  }

  const reflections = reflectionsResult.status === 'success' ? reflectionsResult.data : [];

  return (
    <PublicProfile
      user={profileData.user}
      submissions={profileData.submissions}
      reflections={reflections}
      privacy={profileData.privacy}
      socialLinks={profileData.socialLinks}
      embeddedMedia={profileData.embeddedMedia}
      isOwnProfile={isOwnProfile}
    />
  );
};

export default PublicProfilePage;
