"use client";

import { routes } from "@eptss/routing";
import { useRoute } from "@eptss/routing/client";
import Link from "next/link";
import { HomeIcon, HistoryIcon, UserIcon, MusicNoteIcon, ChatBubbleLeftEllipsisIcon } from "@eptss/ui";
import { Shield, FileText } from "lucide-react";
import { extractParams } from "@eptss/routing";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const SidebarItem = ({ href, icon, label, isActive, onClick, isCollapsed }: SidebarItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
      ${isActive
        ? "bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-black"
        : "hover:bg-white/30 text-accent-secondary hover:text-white"
      }
      ${isCollapsed ? "justify-center" : ""}`}
    title={isCollapsed ? label : ""}
  >
    {icon}
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </Link>
);

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onNavigate: () => void;
  isAdmin?: boolean;
}

export function DashboardSidebar({ isSidebarOpen, isCollapsed, toggleCollapse, onNavigate, isAdmin = false }: DashboardSidebarProps) {
  const route = useRoute();

  // Extract project slug from pathname using routing utilities
  const params = extractParams(route.pathname, '/projects/[slug]');
  const projectSlug = params?.slug || 'cover'; // Default to 'cover' if not found

  return (
    <aside
      className={`bg-background-primary/50 backdrop-blur-xs h-full px-3 py-4 transition-all duration-500 ease-in-out md:border-r md:border-accent-secondary/20 md:z-40 md:pt-20 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
    >
      <nav className="space-y-2 md:sticky md:top-24">
        <SidebarItem
          href={routes.dashboard.root()}
          icon={<HomeIcon className="w-5 h-5" />}
          label="Dashboard"
          isActive={route.isTree('/dashboard')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={routes.projects.reflections.list(projectSlug)}
          icon={<FileText className="w-5 h-5" />}
          label="Reflections"
          isActive={route.isTree('/reflections') || route.matches('/projects/[slug]/reflections')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={routes.legacy.rounds()}
          icon={<HistoryIcon className="w-5 h-5" />}
          label="Past Rounds"
          isActive={route.is('/rounds')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={routes.dashboard.profile()}
          icon={<UserIcon className="w-5 h-5" />}
          label="Profile"
          isActive={route.is('/dashboard/profile')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={routes.legacy.reporting()}
          icon={<MusicNoteIcon className="w-5 h-5" />}
          label="Past Submitted Songs"
          isActive={route.is('/reporting')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={routes.feedback()}
          icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />}
          label="Feedback"
          isActive={route.is('/feedback')}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        {isAdmin && (
          <SidebarItem
            href={routes.admin.root()}
            icon={<Shield className="w-5 h-5" />}
            label="Admin"
            isActive={route.isTree('/admin')}
            onClick={onNavigate}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>
    </aside>
  );
}
