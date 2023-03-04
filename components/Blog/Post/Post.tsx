import ReactMarkdown from "react-markdown";
export const Post = ({ post }) => {
  console.log({ post: post.content });
  return <ReactMarkdown>{post.content}</ReactMarkdown>;
};
