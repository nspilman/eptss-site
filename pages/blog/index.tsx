import { PageContainer } from "components/shared/PageContainer";
import { GetServerSidePropsContext } from "next";

import { BlogHome } from "components/Blog";
import { getAllPosts } from "serverFunctions/getAllPosts";
import { BlogPost } from "types/BlogPost";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";

function BlogPage({ posts }: { posts: BlogPost[] }) {
  return (
    <PageContainer title="Blog Home">
      <BlogHome posts={posts} />
    </PageContainer>
  );
}

export async function getStaticProps(ctx: GetServerSidePropsContext) {
  const posts = getAllPosts();
  return {
    props: {
      posts,
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
}

export default BlogPage;
