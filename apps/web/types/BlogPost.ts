export interface BlogPost {
  frontmatter: {
    title: string;
    subtitle: string;
    date?: string; // Optional date field
    author?: string; // Author name (full name or username)
  };
  slug: string;
  content: string;
}
