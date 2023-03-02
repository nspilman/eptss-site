import { Box, Flex } from "@chakra-ui/react";
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
    <Box p="0" width="100vw">
      <Head>
        <title>{`${title} | Everyone Plays the Same Song`}</title>
      </Head>
      <Flex
        py="16"
        px="8"
        flexWrap="wrap"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        {children}
      </Flex>
    </Box>
  );
};
