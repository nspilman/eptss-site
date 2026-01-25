import { getAllPosts } from "../../services/blogPostService";

export const blogProvider = () => {
  const posts = getAllPosts();
  return { posts };
};
