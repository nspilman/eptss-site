import { PageContainer } from "components/shared/PageContainer";
import { GetServerSidePropsContext } from "next";

import { BlogHome } from "components/Blog";
import { getAllPosts } from "../../serverFunctions/getAllPosts";

function BlogPage({
  posts,
}: {
  posts: {
    frontmatter: {
      title: string;
    };
    slug: string;
  }[];
}) {
  return (
    <PageContainer title="Blog">
      <BlogHome posts={posts} />
    </PageContainer>
  );
}

export async function getStaticProps(ctx: GetServerSidePropsContext) {
  const posts = getAllPosts();
  return {
    props: {
      posts,
    }, // will be passed to the page component as props
    notFound: process.env.NODE_ENV === "production",
  };
}

export default BlogPage;
