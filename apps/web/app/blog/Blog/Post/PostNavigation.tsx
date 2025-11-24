import { BlogPost } from "types/BlogPost";
import { Label, Text, type LabelProps, type TextProps } from "@eptss/ui";

interface PostNavigationProps {
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
}

export const PostNavigation = ({ prevPost, nextPost }: PostNavigationProps) => {
  return (
    <nav className="flex justify-between items-center mt-16 pt-8 border-t border-[var(--color-gray-800)] gap-4">
      {nextPost ? (
        <a
          href={`/blog/${nextPost.slug}`}
          className="flex flex-col items-start text-left group max-w-[45%]"
        >
          <Label size="xs" color="accent-secondary" className="mb-1">Next</Label>
          <Text
            as="span"
            size="base"
            weight="bold"
            className="font-fraunces text-[var(--color-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-200"
          >
            &larr; {nextPost.frontmatter.title}
          </Text>
        </a>
      ) : <div />}
      {prevPost ? (
        <a
          href={`/blog/${prevPost.slug}`}
          className="flex flex-col items-end text-right group max-w-[45%] ml-auto"
        >
          <Label size="xs" color="accent-secondary" className="mb-1">Previous</Label>
          <Text
            as="span"
            size="base"
            weight="bold"
            className="font-fraunces text-[var(--color-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-200"
          >
            {prevPost.frontmatter.title} &rarr;
          </Text>
        </a>
      ) : <div />}
    </nav>
  );
};
