import { Heading, Stack, Text, UnorderedList } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { BlogPost } from "types/BlogPost";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { ReactNode } from "react";

interface Props {
  post: BlogPost;
}

const newTheme = {
  h3: (props: { children: ReactNode }) => {
    const { children } = props;
    return (
      <Heading my={8} size="md">
        {children}
      </Heading>
    );
  },
  p: (props: { children: ReactNode }) => {
    const { children } = props;
    return (
      <Text p={2} fontSize="16">
        {children}
      </Text>
    );
  },
  hr: (props: { children: ReactNode }) => {
    const { children } = props;
    return <Text p="4">{children}</Text>;
  },
};

export const Post = ({ post: { content, frontmatter } }: Props) => {
  return (
    <Stack>
      <Heading size="lg" pb="4">
        {frontmatter.title}
      </Heading>
      <ReactMarkdown components={ChakraUIRenderer(newTheme)}>
        {content}
      </ReactMarkdown>
    </Stack>
  );
};
