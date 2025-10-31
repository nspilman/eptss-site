import { BlogPost } from "types/BlogPost";
import { Reflection } from "@eptss/data-access";
import Link from "next/link";
import { formatDate } from "@eptss/data-access/utils/formatDate";

export const BlogHome = ({ posts, reflections }: { posts: BlogPost[]; reflections: Reflection[] }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Blog Posts Section */}
      <section className="w-full">
        <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl pb-6 self-start tracking-tight">
          The Blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
              <div className="relative h-full flex flex-col bg-[var(--color-background-primary)] border border-[var(--color-gray-700)] rounded-xl p-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                {/* Date Badge - floating top left */}
                {date && (
                  <span className="absolute -top-3 left-4 text-xs font-semibold font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-3 py-1 rounded-full shadow-md border border-[var(--color-gray-700)] z-10">
                    {formatDate(date)}
                  </span>
                )}
                {/* Title with accent underline on hover */}
                <h2 className="text-[var(--color-primary)] text-xl font-black font-fraunces mb-2 relative transition-colors duration-300 group-hover:text-[var(--color-accent-primary)] mt-2">
                  {title}
                  <span className="block h-1 w-8 mt-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </h2>
                {/* Subtitle */}
                <span className="text-sm font-roboto text-[var(--color-gray-300)] leading-relaxed mb-4 line-clamp-2">
                  {subtitle}
                </span>
                {/* Read more CTA */}
                <div className="mt-auto flex items-center gap-1 text-[var(--color-accent-primary)] text-sm font-semibold tracking-tight group-hover:gap-2 transition-all duration-300">
                  <span className="underline underline-offset-2 decoration-[var(--color-accent-primary)] decoration-1 group-hover:decoration-2">Read more</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </article>
          </Link>
        ))}
        </div>
      </section>

      {/* Community Reflections Section */}
      {reflections.length > 0 && (
        <section className="w-full">
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-3xl pb-6 self-start tracking-tight">
            Community Reflections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {reflections.map((reflection) => (
              <Link
                href={`/reflections/${reflection.slug}`}
                className="group transition-all duration-300 h-full"
                key={reflection.slug}
              >
                <article
                  className="relative h-full group-hover:scale-[1.025] transition-transform duration-300"
                >
                  {/* Gradient border effect */}
                  <div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500"></div>

                  {/* Card content */}
                  <div className="relative h-full flex flex-col bg-[var(--color-background-primary)] border border-[var(--color-gray-700)] rounded-xl p-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {/* Date Badge - floating top left */}
                    {reflection.publishedAt && (
                      <span className="absolute -top-3 left-4 text-xs font-semibold font-roboto text-[var(--color-accent-secondary)] bg-[var(--color-gray-900-40)] px-3 py-1 rounded-full shadow-md border border-[var(--color-gray-700)] z-10">
                        {formatDate(reflection.publishedAt)}
                      </span>
                    )}
                    {/* Title with accent underline on hover */}
                    <h2 className="text-[var(--color-primary)] text-xl font-black font-fraunces mb-2 relative transition-colors duration-300 group-hover:text-[var(--color-accent-primary)] mt-2">
                      {reflection.title}
                      <span className="block h-1 w-8 mt-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </h2>
                    {/* Author and Round Info */}
                    <div className="text-sm font-roboto text-[var(--color-gray-400)] mb-4 leading-relaxed">
                      {reflection.authorName && (
                        <span>by {reflection.authorName}</span>
                      )}
                      {reflection.authorName && reflection.roundSlug && (
                        <span className="mx-2">•</span>
                      )}
                      {reflection.roundSlug && (
                        <span>Round: {reflection.roundSlug}</span>
                      )}
                    </div>
                    {/* Read more CTA */}
                    <div className="mt-auto flex items-center gap-1 text-[var(--color-accent-primary)] text-sm font-semibold tracking-tight group-hover:gap-2 transition-all duration-300">
                      <span className="underline underline-offset-2 decoration-[var(--color-accent-primary)] decoration-1 group-hover:decoration-2">Read more</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
