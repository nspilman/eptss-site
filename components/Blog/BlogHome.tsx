import { Card, CardHeader, Stack } from "@chakra-ui/react";
import { BlogPost } from "types/BlogPost";

export const BlogHome = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <Stack alignItems="baseline" width="100vw">
      <h2 className="font-fraunces text-white font-bold text-3xl">The Blog</h2>
      {posts.map(({ frontmatter: { title, subtitle }, slug }) => (
        <Card bg="bgTransparent" key={slug} mx="8" width="100%">
          <CardHeader>
            <a href={`blog/${slug}`} className="hover:text-themeYellow">
              <h2 className="text-white hover:text-themeYellow pb-4 text-lg font-bold font-fraunces">
                {title}
              </h2>

              <span className="text-sm font-light font-roboto text-white">
                {subtitle}
              </span>
            </a>
          </CardHeader>
        </Card>
      ))}
    </Stack>
  );
};
