import { Post } from "components/Blog/Post/Post";
import { PageContainer } from "components/shared/PageContainer";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";
import { getAllPosts } from "serverFunctions/getAllPosts";
import { BlogPost } from "types/BlogPost";

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map(({ slug }) => ({
    params: { slug },
  }));
  return { paths: paths, fallback: false };
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = getAllPosts().find((post) => post.slug === slug);

  return {
    // Passed to the page component as props
    props: { post },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
}

export default function PostPage({ post }: { post: BlogPost }) {
  return (
    <PageContainer title={post.slug}>
      <Post post={post} />
    </PageContainer>
  );
}
