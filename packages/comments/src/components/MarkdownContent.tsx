"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import { Badge } from "@eptss/ui";

interface MarkdownContentProps {
  content: string;
}

/**
 * Process mentions in content and convert them to markdown links
 * Format: @[Display Name](username) -> [@Display Name](/profile/username)
 */
function processMentions(content: string): string {
  // Match the mention format: @[Display Name](username)
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  return content.replace(mentionRegex, (match, displayName, username) => {
    return `[@${displayName}](/profile/${username})`;
  });
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const processedContent = processMentions(content);

  return (
    <div className="markdown-content font-roboto text-[var(--color-primary)] text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 last:mb-0">{children}</p>
          ),
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0 text-[var(--color-primary)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-[var(--color-primary)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2 mt-3 first:mt-0 text-[var(--color-primary)]">
              {children}
            </h3>
          ),
          // Links
          a: ({ href, children }) => {
            // Handle undefined href
            if (!href) {
              return <span>{children}</span>;
            }

            // Check if this is a profile mention link
            const isMention = href.startsWith("/profile/");

            if (isMention) {
              return (
                <Link
                  href={href}
                  aria-label={`View profile of ${children}`}
                  className="no-underline"
                >
                  <Badge variant="mention" asChild>
                    <span>{children}</span>
                  </Badge>
                </Link>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] underline transition-colors"
              >
                {children}
              </a>
            );
          },
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[var(--color-primary)]">{children}</li>
          ),
          // Code
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-[var(--color-gray-800)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--color-accent-primary)]">
                {children}
              </code>
            ) : (
              <code className="block bg-[var(--color-gray-800)] p-3 rounded my-3 overflow-x-auto text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[var(--color-gray-800)] p-3 rounded my-3 overflow-x-auto">
              {children}
            </pre>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[var(--color-accent-primary)] pl-4 py-2 my-3 italic text-[var(--color-gray-300)]">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-[var(--color-gray-700)] rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--color-gray-800)]">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-[var(--color-gray-700)]">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-[var(--color-primary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-[var(--color-primary)]">{children}</td>
          ),
          // Strong (bold)
          strong: ({ children }) => (
            <strong className="font-bold text-[var(--color-primary)]">{children}</strong>
          ),
          // Em (italic)
          em: ({ children }) => (
            <em className="italic text-[var(--color-primary)]">{children}</em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="border-[var(--color-gray-700)] my-4" />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
