import { Card, CardHeader, Heading, Link, Stack } from "@chakra-ui/react";
import { BlogPost } from "types/BlogPost";

export const BlogHome = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <Stack alignItems="baseline" width="100vw">
      <Heading>The Blog</Heading>
      {posts.map(({ frontmatter: { title, subtitle }, slug }) => (
        <Card bg="bgTransparent" key={slug} mx="8" width="100%">
          <CardHeader>
            <Link href={`blog/${slug}`}>
              <h2 className="text-white pb-4 text-lg font-bold font-fraunces">
                {title}
              </h2>
              <span className="text-md font-light font-roboto text-white">
                {subtitle}
              </span>
            </Link>
          </CardHeader>
        </Card>
      ))}
    </Stack>
  );
};
