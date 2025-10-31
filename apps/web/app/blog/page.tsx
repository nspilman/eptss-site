import { PageTitle } from "@/components/PageTitle";
import { BlogHome } from "@/app/blog/Blog";
import { blogProvider } from "@eptss/data-access/providers/blogProvider";
import { getAllPublicReflections } from "@eptss/data-access";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Everyone Plays the Same Song",
  description: "Read about our community's musical journey, project updates, and stories from participants in Everyone Plays the Same Song.",
  openGraph: {
    title: "Blog | Everyone Plays the Same Song",
    description: "Read about our community's musical journey, project updates, and stories from participants in Everyone Plays the Same Song.",
  },
};

const BlogPage = async () => {
  const { posts } = blogProvider();

  // Fetch public reflections
  const reflectionsResult = await getAllPublicReflections();
  const reflections = reflectionsResult.status === 'success' ? reflectionsResult.data : [];

  console.log("Making sure the web app rebuilds!")
  return (
    <>
      <PageTitle title="Blog Home" />
      <BlogHome posts={posts} reflections={reflections} />
    </>
  );
};

export default BlogPage;
