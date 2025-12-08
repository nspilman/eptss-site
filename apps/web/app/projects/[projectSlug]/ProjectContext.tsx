"use client";

import { createContext, useContext, ReactNode } from 'react';

interface ProjectContextValue {
  projectSlug: string;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  children,
  projectSlug,
  projectId
}: {
  children: ReactNode;
  projectSlug: string;
  projectId: string;
}) {
  return (
    <ProjectContext.Provider value={{ projectSlug, projectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
