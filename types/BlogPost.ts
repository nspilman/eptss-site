export interface BlogPost {
  frontmatter: {
    title: string;
    subtitle: string;
  };
  slug: string;
  content: string;
}
