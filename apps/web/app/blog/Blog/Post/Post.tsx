import ReactMarkdown from "react-markdown";
import { formatDate } from "@eptss/data-access/utils/formatDate";
import { markdownTheme } from "./MarkdownTheme";
import { BlogPost } from "types/BlogPost";
import React from "react";
import Link from "next/link";

interface Props {
  post: BlogPost;
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  authorUsername?: string; // Username for profile linking
}



export const Post = ({ post: { content, frontmatter }, prevPost, nextPost, authorUsername }: Props) => {
  const { title, subtitle, date, author } = frontmatter;
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
            {formatDate(date)}
          </span>
        )}
        <h1 className="font-fraunces text-[var(--color-primary)] font-black text-4xl md:text-5xl leading-tight mb-3 tracking-tight">
          {title}
        </h1>
        {author && (
          <div className="text-sm font-roboto text-[var(--color-gray-400)] mb-2">
            by{" "}
            {authorUsername ? (
              <Link
                href={`/profile/${authorUsername}`}
                className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors underline"
              >
                {author}
              </Link>
            ) : (
              <span>{author}</span>
            )}
          </div>
        )}
        {subtitle && (
          <div className="text-lg font-roboto text-[var(--color-gray-300)] mb-2">
            {subtitle}
          </div>
        )}
        <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-4"></div>
      </div>
      {/* Markdown Body */}
      <article className="prose prose-invert prose-lg prose-headings:font-fraunces prose-headings:text-[var(--color-primary)] prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-[var(--color-primary)] prose-p:font-roboto prose-p:text-base prose-li:marker:text-[var(--color-accent-primary)] prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent-primary)] prose-blockquote:bg-[var(--color-background-secondary)] prose-blockquote:text-[var(--color-accent-primary)] prose-blockquote:pl-6 prose-blockquote:py-2 prose-code:bg-[var(--color-gray-900-40)] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[var(--color-accent-secondary)] prose-pre:bg-[var(--color-gray-900-40)] prose-pre:rounded-xl prose-pre:p-4">
        <ReactMarkdown components={markdownTheme}>{content}</ReactMarkdown>
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
