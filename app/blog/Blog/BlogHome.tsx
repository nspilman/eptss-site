import { BlogPost } from "types/BlogPost";

export const BlogHome = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <div className="flex flex-col items-baseline w-[100vw]">
      <h2 className="font-fraunces text-white font-bold text-3xl pb-2">
        The Blog
      </h2>
      {posts.map(({ frontmatter: { title, subtitle }, slug }) => (
        <article
          className="bg-bgTransparent mx-8 py-8 shadow-sm shadow-themeYellow px-4"
          key={slug}
        >
          <div>
            <a href={`blog/${slug}`} className="hover:text-themeYellow">
              <h2 className="text-white hover:text-themeYellow pb-4 text-lg font-bold font-fraunces">
                {title}
              </h2>

              <span className="text-sm font-light font-roboto text-white">
                {subtitle}
              </span>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
};
