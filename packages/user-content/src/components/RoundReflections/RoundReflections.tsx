import Link from 'next/link';
import { getReflectionsByRound, type Reflection } from '@eptss/data-access/services/reflectionService';
import { Card, CardHeader, CardContent } from '@eptss/ui';

interface RoundReflectionsProps {
  roundId: number;
}

/**
 * Display all public reflections for a round
 */
export async function RoundReflections({ roundId }: RoundReflectionsProps) {
  const result = await getReflectionsByRound(roundId, true); // publicOnly = true

  if (result.status !== 'success' || !result.data || result.data.length === 0) {
    return null; // Don't show section if no reflections
  }

  const reflections = result.data;

  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Community Reflections</h2>
      <p className="text-gray-400 mb-6">
        See what participants are thinking about this round
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {reflections.map((reflection) => (
          <Link
            key={reflection.id}
            href={`/reflections/${reflection.slug}`}
            className="block hover:opacity-80 transition-opacity"
          >
            <Card className="h-full">
              <CardHeader>
                <h3 className="text-lg font-semibold line-clamp-2">
                  {reflection.title}
                </h3>
                {reflection.authorName && (
                  <p className="text-sm text-gray-400 mt-1">
                    by {reflection.authorName}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400 mb-2">
                  {new Date(reflection.publishedAt || reflection.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-300 line-clamp-3">
                  {/* Show first 150 chars of markdown as preview */}
                  {reflection.markdownContent.substring(0, 150)}
                  {reflection.markdownContent.length > 150 && '...'}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
