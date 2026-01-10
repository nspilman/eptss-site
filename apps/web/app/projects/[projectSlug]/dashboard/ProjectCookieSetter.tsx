"use client";

import { useEffect } from 'react';
import { setLastViewedProject } from './actions';

interface ProjectCookieSetterProps {
  projectSlug: string;
}

/**
 * Client component that sets the last viewed project cookie
 * This is necessary because cookies can only be set in Server Actions or Route Handlers
 */
export function ProjectCookieSetter({ projectSlug }: ProjectCookieSetterProps) {
  useEffect(() => {
    setLastViewedProject(projectSlug);
  }, [projectSlug]);

  return null;
}
