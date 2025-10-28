'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from '@eptss/rich-text-editor';
import { updateReflection } from '@eptss/data-access';
import type { Reflection } from '../../types';

interface ReflectionEditFormProps {
  reflection: Reflection;
}

export const ReflectionEditForm: React.FC<ReflectionEditFormProps> = ({
  reflection,
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(reflection.title);
  const [content, setContent] = useState(reflection.markdownContent);
  const [isPublic, setIsPublic] = useState(reflection.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please write some content');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateReflection(reflection.id, {
        title: title.trim(),
        markdownContent: content,
        isPublic,
      });

      if (result.status === 'success') {
        // Redirect back to the reflection page
        router.push(`/reflections/${reflection.slug}`);
      } else if (result.status === 'error') {
        setError(result.error.message || 'Failed to update reflection');
      } else {
        setError('Failed to update reflection');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error updating reflection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine reflection type from tags for display
  const isCheckIn = reflection.tags?.includes('reflection-type:checkin');
  const reflectionTypeName = isCheckIn ? 'Check-in Reflection' : 'Initial Reflection';

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
          Edit {reflectionTypeName}
        </h1>
        <p className="text-[var(--color-gray-300)]">
          Update your thoughts and experiences
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Title Input */}
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--color-primary)] mb-2"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your reflection a title..."
          className="w-full px-4 py-3 bg-[var(--color-background-secondary)] border border-[var(--color-gray-700)] rounded-lg text-[var(--color-primary)] placeholder-[var(--color-gray-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Markdown Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Content
        </label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Share your journey, challenges, breakthroughs, and learnings from this round..."
          height={500}
        />
      </div>

      {/* Public/Private Toggle */}
      <div className="mb-8 flex items-center gap-3 p-4 bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)]">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 text-[var(--color-accent-primary)] bg-[var(--color-gray-900)] border-[var(--color-gray-700)] rounded focus:ring-[var(--color-accent-primary)] focus:ring-2"
          disabled={isSubmitting}
        />
        <label htmlFor="isPublic" className="text-sm text-[var(--color-primary)]">
          Make this reflection public (others can view it)
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-[var(--color-accent-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 bg-[var(--color-gray-800)] text-[var(--color-primary)] font-medium rounded-lg hover:bg-[var(--color-gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gray-600)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
