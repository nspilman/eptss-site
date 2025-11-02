"use client";

import Link from "next/link";
import { formatDate } from "@eptss/data-access/utils/formatDate";
import { Reflection } from "@eptss/data-access";
import { Card, CardContent } from "@eptss/ui";

interface PublicProfileProps {
  user: {
    username: string;
    fullName: string | null;
    displayName: string;
    bio: string | null;
    showEmail: boolean;
  };
  submissions: Array<{
    id: string;
    soundcloudUrl: string;
    createdAt: string | null;
    roundSlug: string | null;
    roundId: number;
    songTitle: string;
    songArtist: string;
  }>;
  reflections: Reflection[];
  privacy: {
    showStats: boolean;
    showSignups: boolean;
    showSubmissions: boolean;
    showVotes: boolean;
  };
  isOwnProfile?: boolean;
}

export const PublicProfile = ({ user, submissions, reflections, privacy, isOwnProfile }: PublicProfileProps) => {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header Section */}
      <section className="w-full">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-fraunces text-[var(--color-primary)] font-black text-4xl md:text-5xl mb-2 tracking-tight">
                {user.displayName}
              </h1>
              <p className="text-[var(--color-gray-400)] text-lg font-roboto">
                @{user.username}
              </p>
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
            <p className="text-[var(--color-gray-300)] text-base font-roboto mt-4 max-w-2xl">
              {user.bio}
            </p>
          )}
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mt-4"></div>
        </div>
      </section>

      {/* Submissions Section */}
      {submissions.length > 0 && (
        <section className="w-full">
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl pb-6 self-start tracking-tight">
            Submissions
          </h2>
          <div className="grid grid-cols-1 gap-6 w-full">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="relative group transition-all duration-300"
              >
                {/* Gradient border effect */}
                <div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500"></div>

                {/* Card content */}
                <Card className="relative group-hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-fraunces text-[var(--color-primary)] mb-1">
                        {submission.songTitle}
                      </h3>
                      <p className="text-sm text-[var(--color-gray-300)] font-roboto mb-2">
                        by {submission.songArtist}
                      </p>
                      {submission.createdAt && (
                        <p className="text-xs text-[var(--color-gray-400)] font-roboto">
                          Submitted {formatDate(submission.createdAt)}
                        </p>
                      )}
                    </div>
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
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Reflections Section */}
      {reflections.length > 0 && (
        <section className="w-full">
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl pb-6 self-start tracking-tight">
            Reflections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {reflections.map((reflection) => (
              <Link
                href={`/reflections/${reflection.slug}`}
                className="group transition-all duration-300 h-full"
                key={reflection.slug}
              >
                <article className="relative h-full group-hover:scale-[1.025] transition-transform duration-300">
                  {/* Gradient border effect */}
                  <div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500"></div>

                  {/* Card content */}
                  <Card className="relative h-full group-hover:shadow-xl transition-shadow duration-300 overflow-visible">
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
      {submissions.length === 0 && reflections.length === 0 && (
        <section className="w-full text-center py-12">
          <p className="text-[var(--color-gray-400)] text-lg font-roboto">
            This user hasn't shared any public content yet.
          </p>
        </section>
      )}
    </div>
  );
};
