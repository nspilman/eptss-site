"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, FormLabel } from "@eptss/ui";

export type Project = {
  id: string;
  name: string;
  slug: string;
};

type ProjectSelectorProps = {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  label?: string;
  className?: string;
};

export function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectChange,
  label = "Select Project",
  className = ""
}: ProjectSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <FormLabel className="text-primary">{label}</FormLabel>
      <Select value={selectedProjectId} onValueChange={onProjectChange}>
        <SelectTrigger className="text-primary">
          <SelectValue placeholder="-- Select a project --" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
