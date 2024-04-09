import { PageTitle } from "@/components/PageTitle";
import { BlogHome } from "@/app/blog/Blog";
import { blogProvider } from "@/providers/blogProvider/blogProvider";

const BlogPage = () => {
  const { posts } = blogProvider();
  return (
    <>
      <PageTitle title="Blog Home" />
      <BlogHome posts={posts} />
    </>
  );
};

export default BlogPage;
