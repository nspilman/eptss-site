"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Music, Sparkles } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@eptss/ui";

interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  config: any;
}

interface ProjectSwitcherProps {
  projects: ProjectInfo[];
  currentProjectSlug?: string;
}

export function ProjectSwitcher({ projects, currentProjectSlug }: ProjectSwitcherProps) {
  const router = useRouter();

  // Don't show if user only has one project
  if (projects.length <= 1) {
    return null;
  }

  const currentProject = projects.find(p => p.slug === currentProjectSlug);

  const handleProjectSwitch = (slug: string) => {
    router.push(`/projects/${slug}/dashboard`);
  };

  const getProjectIcon = (project: ProjectInfo) => {
    const iconColor = project.config?.ui?.primaryColor || "#3b82f6";
    const IconComponent = project.config?.metadata?.icon === "sparkles" ? Sparkles : Music;

    return <IconComponent className="w-4 h-4" style={{ color: iconColor }} />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-secondary/50 transition-colors"
        >
          {currentProject && (
            <>
              {getProjectIcon(currentProject)}
              <span className="hidden sm:inline text-sm font-medium">
                {currentProject.name}
              </span>
            </>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-[var(--color-background-primary)] opacity-100">
        <DropdownMenuLabel className="text-xs text-secondary font-semibold uppercase">
          Switch Project
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectSwitch(project.slug)}
            className={`flex items-center gap-3 ${
              project.slug === currentProjectSlug
                ? 'bg-accent-primary/10 text-accent-primary'
                : ''
            }`}
          >
            {getProjectIcon(project)}
            <span className="text-sm font-medium truncate">{project.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
