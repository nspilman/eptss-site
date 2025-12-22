'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '@eptss/ui';
import type { Reflection } from '@eptss/data-access';

interface ReflectionsPanelClientProps {
  reflections: Reflection[];
  projectSlug: string;
}

/**
 * Client component for rendering reflections panel
 * Shows preview of recent reflections with link to full page
 */
export function ReflectionsPanelClient({ reflections, projectSlug }: ReflectionsPanelClientProps) {
  return (
    <div className="space-y-6">
      {/* Header with View All link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[var(--color-accent-primary)]" />
          <h3 className="text-xl font-bold text-[var(--color-primary)]">
            Community Reflections
          </h3>
        </div>
        <Link href={`/projects/${projectSlug}/reflections`}>
          <Button variant="link" className="text-[var(--color-accent-secondary)] hover:text-[var(--color-accent-primary)]">
            View All →
          </Button>
        </Link>
      </div>

      {/* Reflections Preview */}
      {reflections.length > 0 ? (
        <div className="space-y-4">
          {reflections.slice(0, 3).map((reflection) => (
            <Link
              key={reflection.id}
              href={`/projects/${projectSlug}/reflections/${reflection.slug}`}
              className="block hover:opacity-80 transition-opacity"
            >
              <Card className="bg-[var(--color-gray-900-40)] border-[var(--color-gray-700)] hover:border-[var(--color-accent-secondary)]/50">
                <CardHeader className="pb-2">
                  <h4 className="text-base font-semibold line-clamp-1 text-[var(--color-primary)]">
                    {reflection.title}
                  </h4>
                  {reflection.authorName && (
                    <p className="text-xs text-gray-400 mt-1">
                      by {reflection.authorName}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(reflection.publishedAt || reflection.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-300 line-clamp-2">
                    {reflection.markdownContent.substring(0, 120)}
                    {reflection.markdownContent.length > 120 && '...'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] mb-3">
            <FileText className="w-6 h-6 text-[var(--color-accent-secondary)]" />
          </div>
          <p className="text-[var(--color-gray-400)] text-sm">
            No reflections have been shared yet.
          </p>
          <p className="text-[var(--color-gray-500)] text-xs mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
}
