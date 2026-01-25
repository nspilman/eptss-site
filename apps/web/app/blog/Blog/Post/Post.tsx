import ReactMarkdown from "react-markdown";
import { formatDate } from "@eptss/core/utils/formatDate";
import { markdownTheme } from "./MarkdownTheme";
import { BlogPost } from "types/BlogPost";
import React from "react";
import Link from "next/link";
import { BackButton } from "./BackButton";

import { Text } from "@eptss/ui";
interface Props {
  post: BlogPost;
  authorUsername?: string; // Username for profile linking
}

export const Post = ({ post: { content, frontmatter }, authorUsername }: Props) => {
  const { title, subtitle, date, author } = frontmatter;
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-2">
      {/* Back Button */}
      <BackButton />
      {/* Header Section */}
      <div className="mb-10">
        {date && (
          <Text as="span" size="xs" weight="semibold" className="inline-block font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-4 py-1 rounded-full shadow-sm border border-[var(--color-gray-700)] mb-4">
            {formatDate(date)}
          </Text>
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
    </div>
  );
};
