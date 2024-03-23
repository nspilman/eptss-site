import { Post } from "@/app/blog/Blog/Post";
import { PageTitle } from "@/components/PageTitle";
import { getAllPosts } from "@/serverFunctions/getAllPosts";
import { PageNotFoundError } from "next/dist/shared/lib/utils";

const BlogPost = ({ params }: { params: { slug: string } }) => {
  const post = getAllPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return <div>page not found</div>;
  }
  return (
    <>
      <PageTitle title={post.slug} />
      <Post post={post} />
    </>
  );
};

export default BlogPost;
