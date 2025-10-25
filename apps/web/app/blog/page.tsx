import { PageTitle } from "@/components/PageTitle";
import { BlogHome } from "@/app/blog/Blog";
import { blogProvider } from "@eptss/data-access/providers/blogProvider";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Everyone Plays the Same Song",
  description: "Read about our community's musical journey, project updates, and stories from participants in Everyone Plays the Same Song.",
  openGraph: {
    title: "Blog | Everyone Plays the Same Song",
    description: "Read about our community's musical journey, project updates, and stories from participants in Everyone Plays the Same Song.",
  },
};

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
