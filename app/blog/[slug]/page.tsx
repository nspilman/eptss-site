import { Post } from "@/app/blog/Blog/Post";
import { PageTitle } from "@/components/PageTitle";
import { blogProvider } from "@/providers/blogProvider/blogProvider";

const BlogPost = ({ params }: { params: { slug: string } }) => {
  const { posts } = blogProvider();
  const post = posts.find((post) => post.slug === params.slug);
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
