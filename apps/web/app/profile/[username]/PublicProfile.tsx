"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@eptss/data-access/utils/formatDate";
import { Reflection, PublicProfileSubmission } from "@eptss/data-access";
import { Card, CardContent, SectionHeader, EmptyState, Display, Text, Heading } from "@eptss/ui";
import { Playlist, Track } from "@eptss/media-display";
import { Share2, Check } from "lucide-react";

function ShareButton({ submissionId }: { submissionId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/share/song/${submissionId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-lg bg-[var(--color-background-secondary)] hover:bg-[var(--color-gray-700)] transition-colors"
      title={copied ? "Link copied!" : "Copy share link"}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Share2 className="w-4 h-4 text-[var(--color-gray-400)]" />
      )}
    </button>
  );
}

interface SocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  displayOrder: number;
}

interface EmbeddedMedia {
  id: string;
  mediaType: 'audio' | 'video' | 'image' | 'embed';
  embedCode: string;
  title: string | null;
  displayOrder: number;
}

interface PublicProfileProps {
  user: {
    userid: string;
    username: string;
    publicDisplayName: string | null;
    profilePictureUrl?: string | null;
    displayName: string;
    bio: string | null;
    showEmail: boolean;
  };
  submissions: PublicProfileSubmission[];
  reflections: Reflection[];
  socialLinks: SocialLink[];
  embeddedMedia: EmbeddedMedia[];
  privacy: {
    showStats: boolean;
    showSignups: boolean;
    showSubmissions: boolean;
    showVotes: boolean;
    showSocialLinks: boolean;
    showEmbeddedMedia: boolean;
  };
  isOwnProfile?: boolean;
}

export const PublicProfile = ({ user, submissions, reflections, socialLinks, embeddedMedia, privacy, isOwnProfile }: PublicProfileProps) => {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header Section */}
      <section className="w-full">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6">
            {/* Profile Picture */}
            {user.profilePictureUrl && (
              <div className="flex-shrink-0">
                <img
                  src={user.profilePictureUrl}
                  alt={user.displayName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[var(--color-accent-primary)]"
                />
              </div>
            )}
            <div className="flex-1">
              <Display size="md" className="mb-2">
                {user.displayName}
              </Display>
              <Text size="lg" color="secondary">
                @{user.username}
              </Text>
            </div>
            {isOwnProfile && (
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 rounded-md font-medium transition-opacity whitespace-nowrap"
              >
                View My Dashboard
              </Link>
            )}
          </div>
          {user.bio && (
            <Text size="base" color="tertiary" className="mt-4 max-w-2xl">
              {user.bio}
            </Text>
          )}
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mt-4"></div>
        </div>
      </section>

      {/* Social Links Section */}
      {socialLinks.length > 0 && (
        <section className="w-full">
          <SectionHeader
            title="Connect"
            className="pb-6"
          />
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-[var(--color-primary)] font-medium transition-all group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
                <span>{link.label || link.platform}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Embedded Media Section */}
      {embeddedMedia.length > 0 && (
        <section className="w-full">
          <SectionHeader
            title="Media"
            className="pb-6"
          />
          <div className="grid grid-cols-1 gap-6 w-full">
            {embeddedMedia.map((media) => (
              <Card key={media.id} className="relative">
                <CardContent>
                  {media.title && (
                    <h3 className="text-lg font-bold font-fraunces text-[var(--color-primary)] mb-4">
                      {media.title}
                    </h3>
                  )}
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: media.embedCode }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Submissions Section */}
      {submissions.length > 0 && (
        <section className="w-full">
          <SectionHeader
            title="Submissions"
            className="pb-6"
          />
          <div className="grid grid-cols-1 gap-6 w-full">
            {submissions.map((submission) => {
              // Create a single-track playlist for the submission
              const track: Track | null = submission.audioFileUrl ? {
                id: submission.id,
                src: submission.audioFileUrl,
                title: submission.songTitle,
                artist: submission.songArtist,
                coverArt: submission.coverImageUrl || user.profilePictureUrl || undefined,
                fileSize: submission.audioFileSize || undefined,
              } : null;

              return (
                <article key={submission.id} className="group">
                  <div className="relative">
                    {/* Share button overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <ShareButton submissionId={submission.id} />
                    </div>

                    {track ? (
                      <Playlist
                        tracks={[track]}
                        showTrackList={false}
                        showControls={false}
                        layout="compact"
                      />
                    ) : submission.soundcloudUrl ? (
                      <Card gradient hover="lift">
                        <CardContent className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Heading as="h3" size="xs" className="mb-1">
                                {submission.songTitle}
                              </Heading>
                              <Text size="sm" color="tertiary" className="mb-2">
                                by {submission.songArtist}
                              </Text>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-4 bg-[var(--color-background-secondary)] rounded-lg">
                            <a
                              href={submission.soundcloudUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 6.5L16 12L7 17.5V6.5Z"/>
                              </svg>
                              Listen on SoundCloud
                            </a>
                          </div>
                          {submission.createdAt && (
                            <Text size="xs" color="secondary">
                              Submitted {formatDate(submission.createdAt)}
                            </Text>
                          )}
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Reflections Section */}
      {reflections.length > 0 && (
        <section className="w-full">
          <SectionHeader
            title="Reflections"
            className="pb-6"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {reflections.map((reflection) => (
              <Link
                href={`/projects/${reflection.projectSlug || 'cover'}/reflections/${reflection.slug}`}
                className="group h-full"
                key={reflection.slug}
              >
                <article className="h-full">
                  <Card gradient hover="scale" className="h-full overflow-visible">
                    <CardContent className="h-full flex flex-col">
                      {/* Date Badge - floating top left */}
                      {reflection.publishedAt && (
                        <span className="absolute -top-3 left-4 text-xs font-semibold font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-3 py-1 rounded-full shadow-md border border-[var(--color-gray-700)] z-10">
                          {formatDate(reflection.publishedAt)}
                        </span>
                      )}
                      {/* Title with accent underline on hover */}
                      <h2 className="text-[var(--color-primary)] text-xl font-black font-fraunces mb-2 relative transition-colors duration-300 group-hover:text-[var(--color-accent-primary)] mt-2">
                        {reflection.title}
                        <span className="block h-1 w-8 mt-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </h2>
                      {/* Round Info */}
                      {reflection.roundSlug && (
                        <div className="text-sm font-roboto text-[var(--color-gray-400)] mb-4 leading-relaxed">
                          <span>Round: {reflection.roundSlug}</span>
                        </div>
                      )}
                      {/* Read more CTA */}
                      <div className="mt-auto flex items-center gap-1 text-[var(--color-accent-primary)] text-sm font-semibold tracking-tight group-hover:gap-2 transition-all duration-300">
                        <span className="underline underline-offset-2 decoration-[var(--color-accent-primary)] decoration-1 group-hover:decoration-2">
                          Read more
                        </span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {submissions.length === 0 && reflections.length === 0 && socialLinks.length === 0 && embeddedMedia.length === 0 && (
        <section className="w-full">
          <EmptyState
            size="lg"
            description="This user hasn't shared any public content yet."
          />
        </section>
      )}
    </div>
  );
};
