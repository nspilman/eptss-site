import { Post } from "@/app/blog/Blog/Post";
import { PageTitle } from "@/components/PageTitle";
import { blogProvider } from "@/providers/blogProvider/blogProvider";
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { posts } = blogProvider();
  const post = posts.find(post => post.slug === resolvedParams.slug);
  
  if (!post) {
    return {
      title: "Blog Post Not Found | Everyone Plays the Same Song",
      description: "The requested blog post could not be found.",
    };
  }
  
  return {
    title: `${post.frontmatter.title} | Everyone Plays the Same Song Blog`,
    description: post.frontmatter.subtitle || "Read this blog post from Everyone Plays the Same Song community.",
    openGraph: {
      title: `${post.frontmatter.title} | Everyone Plays the Same Song Blog`,
      description: post.frontmatter.subtitle || "Read this blog post from Everyone Plays the Same Song community.",
      type: 'article',
      // publishedTime: post.frontmatter.,
      // authors: [post.],
    },
  };
}

const BlogPost = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  const { posts } = blogProvider();
  const idx = posts.findIndex((post) => post.slug === resolvedParams.slug);
  const post = posts[idx];
  if (!post) {
    return <div>page not found</div>;
  }
  const prevPost = idx > 0 ? posts[idx - 1] : null;
  const nextPost = idx < posts.length - 1 ? posts[idx + 1] : null;
  return (
    <>
      <PageTitle title={post.slug} />
      <Post post={post} prevPost={prevPost} nextPost={nextPost} />
    </>
  );
};

export default BlogPost;
