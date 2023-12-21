import ReactMarkdown from "react-markdown";
import { BlogPost } from "types/BlogPost";
import { ReactNode } from "react";

interface Props {
  post: BlogPost;
}

const newTheme = {
  h3: (props: { children: ReactNode }) => {
    const { children } = props;
    return (
      <h2 className="font-fraunces text-white font-bold my-8">{children}</h2>
    );
  },
  p: (props: { children: ReactNode }) => {
    const { children } = props;
    return (
      <p className="text-md font-light font-roboto text-white p-2">
        {children}
      </p>
    );
  },
  hr: (props: { children: ReactNode }) => {
    const { children } = props;
    return (
      <span className="text-md font-light font-roboto text-white p-4">
        {children}
      </span>
    );
  },
};

export const Post = ({ post: { content, frontmatter } }: Props) => {
  return (
    <div className="flex flex-col">
      <h2 className="font-fraunces text-white font-bold pb-4">
        {frontmatter.title}
      </h2>
      <ReactMarkdown components={newTheme}>{content}</ReactMarkdown>
    </div>
  );
};
