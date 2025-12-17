'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteReflection } from '@eptss/data-access';
import type { Reflection } from '@eptss/data-access';
import { Button } from '@eptss/ui';
import { getReflectionSchedule } from '../../utils/reflectionScheduler';
import type { Round } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';

interface ReflectionDisplayProps {
  roundSlug: string;
  projectSlug: string;
  round: Round;
  reflections: Reflection[];
}

export function ReflectionDisplay({ roundSlug, projectSlug, round, reflections }: ReflectionDisplayProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reflectionToDelete, setReflectionToDelete] = useState<Reflection | null>(null);

  // Determine if user has an initial reflection
  const hasInitialReflection = reflections.some(
    r => r.tags?.includes('reflection-type:initial')
  );

  const handleDeleteClick = (reflection: Reflection) => {
    setReflectionToDelete(reflection);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reflectionToDelete) return;

    const result = await deleteReflection(reflectionToDelete.id);

    if (result.status === 'success') {
      setDeleteModalOpen(false);
      setReflectionToDelete(null);
      // Refresh the page to show updated list
      router.refresh();
    } else {
      // Could add error handling UI here
      console.error('Failed to delete reflection');
    }
  };

  // Get the reflection schedule based on round dates
  // Ensure dates are Date objects (they might come as strings from the API)
  console.log('[ReflectionDisplay] Round dates before conversion:', {
    signupOpens: round.signupOpens,
    votingOpens: round.votingOpens,
    coveringBegins: round.coveringBegins,
    coversDue: round.coversDue,
    listeningParty: round.listeningParty,
  });

  const schedule = getReflectionSchedule(
    {
      signupOpens: new Date(round.signupOpens),
      votingOpens: new Date(round.votingOpens),
      coveringBegins: new Date(round.coveringBegins),
      coversDue: new Date(round.coversDue),
      listeningParty: new Date(round.listeningParty),
    },
    hasInitialReflection,
  );

  // Determine button text and availability
  const canCreateReflection = schedule.canCreateInitial || schedule.canCreateCheckin;
  const buttonText = schedule.canCreateInitial
    ? 'Create Initial Reflection'
    : schedule.canCreateCheckin
      ? 'Create Check-in Reflection'
      : 'Create New Reflection';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              My Reflections
            </h2>
            <p className="text-sm text-[var(--color-gray-400)]">
              Your reflections for this round
            </p>
          </div>
        </div>

        {reflections.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{reflections.length} {reflections.length === 1 ? 'reflection' : 'reflections'}</span>
            </div>

            <div className="space-y-3">
              {reflections.map((reflection) => (
                <div key={reflection.id} className="p-4 bg-[var(--color-gray-900-40)] rounded-lg border border-[var(--color-gray-800)] hover:border-[var(--color-accent-primary)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-[var(--color-primary)] flex-1">
                      {reflection.title}
                    </h3>
                    {reflection.isPublic ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded border border-green-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900/50 text-gray-400 text-xs font-medium rounded border border-gray-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-gray-400)] mb-3">
                    Created {new Date(reflection.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/projects/${projectSlug}/reflections/${reflection.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
                    >
                      View reflection
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href={`/projects/${projectSlug}/reflections/${reflection.slug}/edit`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-gray-400)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <Button
                      onClick={() => handleDeleteClick(reflection)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show availability message and button if user can create more reflections */}
            {canCreateReflection && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-[var(--color-gray-900-40)] rounded-lg border border-[var(--color-gray-700)]">
                  <p className="text-sm text-[var(--color-gray-300)]">
                    {schedule.availabilityMessage}
                  </p>
                </div>

                <Button asChild variant="secondary" size="lg">
                  <Link href={`/projects/${projectSlug}/round/${roundSlug}/create-reflection`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {buttonText}
                  </Link>
                </Button>
              </div>
            )}

            {!canCreateReflection && schedule.availabilityMessage && (
              <div className="mt-6 p-4 bg-[var(--color-gray-900-40)] rounded-lg border border-[var(--color-gray-700)]">
                <p className="text-sm text-[var(--color-gray-300)]">
                  {schedule.availabilityMessage}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--color-gray-300)]">
              {schedule.availabilityMessage || 'Start your journey by reflecting on your initial thoughts on the song to cover, as well as your goals, expectations, and approach for this round.'}
            </p>

            {canCreateReflection ? (
              <Button asChild variant="secondary" size="lg">
                <Link href={`/projects/${projectSlug}/round/${roundSlug}/create-reflection`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {buttonText}
                </Link>
              </Button>
            ) : (
              <div className="p-4 bg-[var(--color-gray-900-40)] rounded-lg border border-[var(--color-gray-700)]">
                <p className="text-sm text-[var(--color-gray-400)]">
                  Reflection creation is currently not available for this phase.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReflectionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Reflection?"
        message={`Are you sure you want to delete "${reflectionToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
