import { PageTitle } from "@/components/PageTitle";
import { getAllPosts } from "@/serverFunctions/getAllPosts";
import { BlogHome } from "@/app/blog/Blog";

const BlogPage = () => {
  const posts = getAllPosts();
  return (
    <>
      <PageTitle title="Blog Home" />
      <BlogHome posts={posts} />
    </>
  );
};

export default BlogPage;
