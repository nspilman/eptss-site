import ReactMarkdown from "react-markdown";
import { BlogPost } from "types/BlogPost";
import { ReactNode } from "react";

interface Props {
  post: BlogPost;
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
}

const newTheme = {
  h1: (props: { children: ReactNode }) => {
    return <h1 className="font-fraunces text-[var(--color-primary)] font-black text-3xl md:text-4xl my-8 leading-tight tracking-tight">{props.children}</h1>;
  },
  h2: (props: { children: ReactNode }) => {
    return <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl my-8 leading-tight">{props.children}</h2>;
  },
  h3: (props: { children: ReactNode }) => {
    return <h3 className="font-fraunces text-[var(--color-primary)] font-bold text-xl md:text-2xl my-6 leading-snug">{props.children}</h3>;
  },
  p: (props: { children: ReactNode }) => {
    return <p className="font-roboto text-[var(--color-primary)] text-base leading-relaxed my-4">{props.children}</p>;
  },
  ul: (props: { children: ReactNode }) => {
    return <ul className="list-disc pl-8 my-4 marker:text-[var(--color-accent-primary)]">{props.children}</ul>;
  },
  ol: (props: { children: ReactNode }) => {
    return <ol className="list-decimal pl-8 my-4 marker:text-[var(--color-accent-primary)]">{props.children}</ol>;
  },
  li: (props: { children: ReactNode }) => {
    return <li className="mb-2 font-roboto text-[var(--color-primary)]">{props.children}</li>;
  },
  blockquote: (props: { children: ReactNode }) => {
    return <blockquote className="border-l-4 border-[var(--color-accent-primary)] bg-[var(--color-background-secondary)] text-[var(--color-accent-primary)] pl-6 py-2 my-6 font-fraunces italic">{props.children}</blockquote>;
  },
  code: (props: { children: ReactNode }) => {
    return <code className="bg-[var(--color-gray-900-40)] px-2 py-1 rounded text-[var(--color-accent-secondary)] font-mono">{props.children}</code>;
  },
  pre: (props: { children: ReactNode }) => {
    return <pre className="bg-[var(--color-gray-900-40)] rounded-xl p-4 overflow-x-auto my-6">{props.children}</pre>;
  },
  hr: () => <hr className="my-8 border-t-2 border-[var(--color-accent-primary)] opacity-40" />,
};

export const Post = ({ post: { content, frontmatter }, prevPost, nextPost }: Props) => {
  const { title, subtitle, date } = frontmatter;
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-12">
      {/* Back to Blog Link */}
      <a
        href="/blog"
        className="self-start mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors duration-200 group"
        aria-label="Back to Blog Home"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block group-hover:-translate-x-1 transition-transform duration-200"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        <span>Back to Blog</span>
      </a>
      {/* Header Section */}
      <div className="mb-10">
        {date && (
          <span className="inline-block text-xs font-semibold font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-4 py-1 rounded-full shadow-sm border border-[var(--color-gray-700)] mb-4">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        <h1 className="font-fraunces text-[var(--color-primary)] font-black text-4xl md:text-5xl leading-tight mb-3 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-lg font-roboto text-[var(--color-gray-300)] mb-2">
            {subtitle}
          </div>
        )}
        <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-4"></div>
      </div>
      {/* Markdown Body */}
      <article className="prose prose-invert prose-lg prose-headings:font-fraunces prose-headings:text-[var(--color-primary)] prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-[var(--color-primary)] prose-p:font-roboto prose-p:text-base prose-li:marker:text-[var(--color-accent-primary)] prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent-primary)] prose-blockquote:bg-[var(--color-background-secondary)] prose-blockquote:text-[var(--color-accent-primary)] prose-blockquote:pl-6 prose-blockquote:py-2 prose-code:bg-[var(--color-gray-900-40)] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[var(--color-accent-secondary)] prose-pre:bg-[var(--color-gray-900-40)] prose-pre:rounded-xl prose-pre:p-4">
        <ReactMarkdown components={newTheme}>{content}</ReactMarkdown>
      </article>
      {/* Next/Prev Navigation */}
      <nav className="flex justify-between items-center mt-16 pt-8 border-t border-[var(--color-gray-800)] gap-4">
        {nextPost ? (
          <a
            href={`/blog/${nextPost.slug}`}
            className="flex flex-col items-start text-left group max-w-[45%]"
          >
            <span className="text-xs text-[var(--color-accent-secondary)] mb-1">Next</span>
            <span className="font-fraunces font-bold text-base text-[var(--color-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-200">
              &larr; {nextPost.frontmatter.title}
            </span>
          </a>
        ) : <div />}
        {prevPost ? (
          <a
            href={`/blog/${prevPost.slug}`}
            className="flex flex-col items-end text-right group max-w-[45%] ml-auto"
          >
            <span className="text-xs text-[var(--color-accent-secondary)] mb-1">Previous</span>
            <span className="font-fraunces font-bold text-base text-[var(--color-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-200">
              {prevPost.frontmatter.title} &rarr;
            </span>
          </a>
        ) : <div />}
      </nav>
    </div>
  );
};
