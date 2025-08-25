import { SharedSignupPageWrapper } from "../SharedSignupPageWrapper";

export default async function SignUpForRound({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <SharedSignupPageWrapper slug={resolvedParams.slug} />;
}
