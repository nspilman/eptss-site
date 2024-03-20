import { PageContainer } from "@/components/shared/PageContainer";
import { getAllPosts } from "@/serverFunctions/getAllPosts";
import { BlogHome } from "@/components/Blog";

const BlogPage = () => {
  const posts = getAllPosts();
  return (
    <PageContainer title="Blog Home">
      <BlogHome posts={posts} />
    </PageContainer>
  );
};

export default BlogPage;
