import { Post } from "@/app/blog/Blog/Post";
import { PageTitle } from "@/components/PageTitle";
import { blogProvider } from "@/providers/blogProvider/blogProvider";
import { Metadata } from 'next';

type Props = {
  params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { posts } = blogProvider();
  const post = posts.find(post => post.slug === params.slug);
  
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
