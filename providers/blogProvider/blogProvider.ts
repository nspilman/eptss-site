import { getAllPosts } from "@/data-access/blogPostService";

export const blogProvider = () => {
  const posts = getAllPosts();
  return { posts };
};
