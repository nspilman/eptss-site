"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Music, Sparkles } from "lucide-react";
import { Button } from "@eptss/ui";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Don't show if user only has one project
  if (projects.length <= 1) {
    return null;
  }

  const currentProject = projects.find(p => p.slug === currentProjectSlug);

  const handleProjectSwitch = (slug: string) => {
    setIsOpen(false);
    router.push(`/projects/${slug}/dashboard`);
  };

  const getProjectIcon = (project: ProjectInfo) => {
    const iconColor = project.config?.ui?.primaryColor || "#3b82f6";
    const IconComponent = project.config?.metadata?.icon === "sparkles" ? Sparkles : Music;

    return <IconComponent className="w-4 h-4" style={{ color: iconColor }} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
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
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-background-primary border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-secondary font-semibold uppercase">
              Switch Project
            </div>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSwitch(project.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  project.slug === currentProjectSlug
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'hover:bg-background-secondary text-primary'
                }`}
              >
                {getProjectIcon(project)}
                <span className="text-sm font-medium truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
