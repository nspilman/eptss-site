import { Post } from "@/components/Blog/Post";
import { PageContainer } from "@/components/shared/PageContainer";
import { getAllPosts } from "@/serverFunctions/getAllPosts";
import { PageNotFoundError } from "next/dist/shared/lib/utils";

const BlogPost = ({ params }: { params: { slug: string } }) => {
  const post = getAllPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return <div>page not found</div>;
  }
  return (
    <PageContainer title={post.slug}>
      <Post post={post} />
    </PageContainer>
  );
};

export default BlogPost;
