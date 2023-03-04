import { Post } from "components/Blog/Post/Post";
import { PageContainer } from "components/shared/PageContainer";
import { getAllPosts } from "serverFunctions/getAllPosts";

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
  };
}

export default function PostPage({ post }: { post: string }) {
  return (
    <PageContainer title={post.slug}>
      <Post post={post} />
    </PageContainer>
  );
}
