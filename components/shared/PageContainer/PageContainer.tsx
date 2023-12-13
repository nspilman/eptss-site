import { Flex } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";

export const PageContainer = ({
  children,
  title,
}: {
  children: React.ReactElement;
  title: string;
}) => {
  return (
    <div className="p-0 w-100">
      <Head>
        <title>{`${title} | Everyone Plays the Same Song`}</title>
      </Head>
      <Flex
        py="24"
        px="8"
        flexWrap="wrap"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        {children}
      </Flex>
    </div>
  );
};
