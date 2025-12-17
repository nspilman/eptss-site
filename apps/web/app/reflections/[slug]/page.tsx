import { redirect } from 'next/navigation';

interface LegacyReflectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyReflectionRedirect({ params }: LegacyReflectionPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Redirect legacy /reflections/[slug] to /projects/cover/reflections/[slug]
  redirect(`/projects/cover/reflections/${slug}`);
}
