import { CreateAccount } from "components/CreateAccount";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";

const CreateAccountPage = ({}: InferGetStaticPropsType<
  typeof getStaticProps
>) => {
  return <CreateAccount />;
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    notFound: process.env.NODE_ENV === "production",
  };
};

export default CreateAccountPage;
