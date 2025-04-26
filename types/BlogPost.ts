export interface BlogPost {
  frontmatter: {
    title: string;
    subtitle: string;
    date?: string; // Optional date field
  };
  slug: string;
  content: string;
}
