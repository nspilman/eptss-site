import { BlogPost } from "types/BlogPost";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";

export const BlogHome = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-12">
      <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-[var(--text-header)] pb-10 self-start tracking-tight">
        The Blog
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        {posts.map(({ frontmatter: { title, subtitle, date }, slug }, idx) => (
          <Link
            href={`blog/${slug}`}
            className="group transition-all duration-300 h-full"
            key={slug}
          >
            <article
              className={
                `relative h-full group-hover:scale-[1.025] transition-transform duration-300`
              }
            >
              {/* Gradient border effect */}
              <div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500"></div>

              {/* Card content */}
              <div className="relative h-full flex flex-col bg-[var(--color-background-primary)] border border-[var(--color-gray-700)] rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                {/* Date Badge - floating top left */}
                {date && (
                  <span className="absolute -top-4 left-6 text-xs font-semibold font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-4 py-1 rounded-full shadow-md border border-[var(--color-gray-700)] z-10">
                    {formatDate(date)}
                  </span>
                )}
                {/* Title with accent underline on hover */}
                <h2 className="text-[var(--color-primary)] text-2xl md:text-2xl font-black font-fraunces mb-3 relative transition-colors duration-300 group-hover:text-[var(--color-accent-primary)]">
                  {title}
                  <span className="block h-1 w-10 mt-2 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </h2>
                {/* Subtitle */}
                <span className="text-base font-roboto text-[var(--color-gray-300)] leading-relaxed mb-6">
                  {subtitle}
                </span>
                {/* Read more CTA */}
                <div className="mt-auto flex items-center gap-1 text-[var(--color-accent-primary)] text-base font-semibold tracking-tight group-hover:gap-3 transition-all duration-300">
                  <span className="underline underline-offset-2 decoration-[var(--color-accent-primary)] decoration-2 group-hover:decoration-4">Read more</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};
