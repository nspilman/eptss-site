"use server";

import path from "path";
import matter from "gray-matter";
import fs from "fs";

const getFileContent = (filename: string, folder: string) => {
  const POSTS_PATH = path.join(process.cwd(), `/${folder}`);
  return fs.readFileSync(path.join(POSTS_PATH, filename), "utf8");
};

interface PostFrontmatter {
  title: string;
  subtitle: string;
}

export const getAllPosts = () => {
  const folder = "blog";
  const POSTS_PATH = path.join(process.cwd(), `/${folder}`);
  return (
    fs
      .readdirSync(POSTS_PATH) // get files in directory
      //   .filter((path) => /\\.md?$/.test(path)) // only .md files
      .map((fileName) => {
        // map over each file
        const body = getFileContent(fileName, folder); // retrieve the file contents
        const slug = fileName.replace(".md", ""); // get the slug from the filename
        const { data: frontmatter, content } = matter(body); // extract frontmatter
        return {
          frontmatter: frontmatter as PostFrontmatter,
          slug,
          content,
        };
      })
  );
};
