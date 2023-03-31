import { GetStaticProps } from "next";
import React from "react";
import { PageContainer } from "components/shared/PageContainer";
import { SignIn } from "components/SignIn";

// TODO: replace <SignIn/> component to use EmailAuthModal
// so we have consistent magic link auth behavior universally
const SignInPage = () => {
  return (
    <PageContainer title={`Sign in to Everyone Plays the Same Song`}>
      <SignIn />
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

export default SignInPage;
