import { Text } from "@eptss/ui";

export function ActivityCard({
    title,
    count,
    description,
    linkText,
    onClick
  }: {
    title: string;
    count: number;
    description: string;
    linkText: string;
    onClick: () => void;
  }) {
    return (
      <div className="relative group">
        {/* Gradient glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>

        <div className="relative rounded-xl p-6 backdrop-blur-xs border border-gray-800 bg-gray-900/50 hover:border-[var(--color-accent-primary)]/50 transition-all duration-300">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
                {title}
              </h3>
              <Text size="sm" className="text-gray-400">
                {description}
              </Text>
            </div>

            {/* Count with gradient */}
            <Text weight="bold" className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
              {count}
            </Text>

            {/* Link button */}
            <button
              onClick={onClick}
              className="text-sm text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors duration-200 flex items-center gap-1 group/link"
            >
              <span>{linkText}</span>
              <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
