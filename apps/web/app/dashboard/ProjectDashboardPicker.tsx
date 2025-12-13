"use client";

import Link from "next/link";
import { Music, Sparkles } from "lucide-react";

interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  config: any;
  isActive: boolean;
}

interface ProjectDashboardPickerProps {
  projects: ProjectInfo[];
}

export function ProjectDashboardPicker({ projects }: ProjectDashboardPickerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent">
            Choose Your Project
          </h1>
          <p className="text-secondary text-lg">
            You're participating in multiple projects. Select one to view your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const iconColor = project.config?.ui?.primaryColor || "#3b82f6";

            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}/dashboard`}
                className="group relative bg-background-secondary border-2 border-border rounded-xl p-8 hover:border-accent-primary transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/20"
              >
                {/* Icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="p-3 rounded-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${iconColor}20` }}
                  >
                    {project.config?.metadata?.icon === "sparkles" ? (
                      <Sparkles className="w-6 h-6" style={{ color: iconColor }} />
                    ) : (
                      <Music className="w-6 h-6" style={{ color: iconColor }} />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold group-hover:text-accent-primary transition-colors">
                    {project.name}
                  </h2>
                </div>

                {/* Description */}
                {project.config?.metadata?.description && (
                  <p className="text-secondary mb-4">
                    {project.config.metadata.description}
                  </p>
                )}

                {/* Tagline */}
                {project.config?.metadata?.tagline && (
                  <p className="text-sm italic text-accent-secondary">
                    "{project.config.metadata.tagline}"
                  </p>
                )}

                {/* Hover indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-sm font-semibold text-accent-primary">
                    View Dashboard →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Return home link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-secondary hover:text-primary transition-colors"
          >
            ← Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
