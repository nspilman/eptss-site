import { Card, CardHeader, Text, Heading, Link, Stack } from "@chakra-ui/react";
import { BlogPost } from "types/BlogPost";

export const BlogHome = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <Stack alignItems="baseline" width="100vw">
      <Heading>The Blog</Heading>
      {posts.map(({ frontmatter: { title, subtitle }, slug }) => (
        <Card bg="bgTransparent" key={slug} mx="8" width="100%">
          <CardHeader>
            <Link href={`blog/${slug}`}>
              <Heading size="sm" pb="4">
                {title}
              </Heading>
              <Text size="sm" fontWeight={300}>
                {subtitle}
              </Text>
            </Link>
          </CardHeader>
        </Card>
      ))}
    </Stack>
  );
};
