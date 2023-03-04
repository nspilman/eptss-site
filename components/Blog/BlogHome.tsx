import { Link, Stack } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const BlogHome = ({
  posts,
}: {
  posts: {
    frontmatter: {
      title: string;
    };
    slug: string;
  }[];
}) => {
  return (
    <Stack>
      {posts.map(({ frontmatter, slug }) => (
        <Link href={`blog/${slug}`} key={slug}>
          {frontmatter.title}
        </Link>
      ))}
    </Stack>
  );
};
