import { SharedSignupPageWrapper } from "../SharedSignupPageWrapper";

export default async function SignUpForRound({
  params,
}: {
  params: { slug: string };
}) {
  return <SharedSignupPageWrapper slug={params.slug} />;
}
