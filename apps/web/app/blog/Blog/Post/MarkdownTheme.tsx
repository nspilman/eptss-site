import { ReactNode } from "react";

// Markdown theme component for react-markdown
export const markdownTheme = {
  h1: (props: { children: ReactNode }) => (
    <h1 className="font-fraunces text-[var(--color-primary)] font-black text-3xl md:text-4xl my-8 leading-tight tracking-tight">{props.children}</h1>
  ),
  h2: (props: { children: ReactNode }) => (
    <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl my-8 leading-tight">{props.children}</h2>
  ),
  h3: (props: { children: ReactNode }) => (
    <h3 className="font-fraunces text-[var(--color-primary)] font-bold text-xl md:text-2xl my-6 leading-snug">{props.children}</h3>
  ),
  p: (props: { children: ReactNode }) => (
    <p className="font-roboto text-[var(--color-primary)] text-base leading-relaxed my-4">{props.children}</p>
  ),
  ul: (props: { children: ReactNode }) => (
    <ul className="list-disc pl-8 my-4 marker:text-[var(--color-accent-primary)]">{props.children}</ul>
  ),
  ol: (props: { children: ReactNode }) => (
    <ol className="list-decimal pl-8 my-4 marker:text-[var(--color-accent-primary)]">{props.children}</ol>
  ),
  li: (props: { children: ReactNode }) => (
    <li className="mb-2 font-roboto text-[var(--color-primary)]">{props.children}</li>
  ),
  blockquote: (props: { children: ReactNode }) => (
    <blockquote className="border-l-4 border-[var(--color-accent-primary)] bg-[var(--color-background-secondary)] text-[var(--color-accent-primary)] pl-6 py-2 my-6 font-fraunces italic">{props.children}</blockquote>
  ),
  code: (props: { children: ReactNode }) => (
    <code className="bg-[var(--color-gray-900-40)] px-2 py-1 rounded text-[var(--color-accent-secondary)] font-mono">{props.children}</code>
  ),
  pre: (props: { children: ReactNode }) => (
    <pre className="bg-[var(--color-gray-900-40)] rounded-xl p-4 overflow-x-auto my-6">{props.children}</pre>
  ),
  hr: () => <hr className="my-8 border-t-2 border-[var(--color-accent-primary)] opacity-40" />,
};
