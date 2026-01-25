import React from "react";
import { getProjectIdFromSlug, type ProjectSlug } from "@eptss/core";
import { SharedSignupPageWrapper } from "./SharedSignupPageWrapper";

interface Props {
  params: Promise<{ projectSlug: string }>;
}

const SignUp = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  return (
    <SharedSignupPageWrapper
      projectId={projectId}
      projectSlug={projectSlug}
    />
  );
};

export default SignUp;
