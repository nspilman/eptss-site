"use client";

import { Navigation } from "@eptss/shared";
import Link from "next/link";
import { HomeIcon, HistoryIcon, UserIcon, MusicNoteIcon, ChatBubbleLeftEllipsisIcon } from "@eptss/ui";
import { Shield, FileText } from "lucide-react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  // Extract project slug from pathname (e.g., /projects/cover/dashboard -> cover)
  const projectSlugMatch = pathname.match(/\/projects\/([^\/]+)/);
  const projectSlug = projectSlugMatch ? projectSlugMatch[1] : 'cover'; // Default to 'cover' if not found

  return (
    <aside
      className={`bg-background-primary/50 backdrop-blur-xs h-full px-3 py-4 transition-all duration-500 ease-in-out md:border-r md:border-accent-secondary/20 md:z-40 md:pt-20 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
    >
      <nav className="space-y-2 md:sticky md:top-24">
        <SidebarItem
          href={Navigation.Dashboard}
          icon={<HomeIcon className="w-5 h-5" />}
          label="Dashboard"
          isActive={pathname === Navigation.Dashboard}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={`/projects/${projectSlug}/reflections`}
          icon={<FileText className="w-5 h-5" />}
          label="Reflections"
          isActive={pathname.includes("/reflections")}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/rounds"
          icon={<HistoryIcon className="w-5 h-5" />}
          label="Past Rounds"
          isActive={pathname === "/rounds"}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href={Navigation.Profile}
          icon={<UserIcon className="w-5 h-5" />}
          label="Profile"
          isActive={pathname === Navigation.Profile}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          href="/reporting"
          icon={<MusicNoteIcon className="w-5 h-5" />}
          label="Past Submitted Songs"
          isActive={pathname === "/reporting"}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/feedback"
          icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />}
          label="Feedback"
          isActive={pathname === "/feedback"}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        {isAdmin && (
          <SidebarItem
            href={Navigation.Admin}
            icon={<Shield className="w-5 h-5" />}
            label="Admin"
            isActive={pathname.startsWith(Navigation.Admin)}
            onClick={onNavigate}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>
    </aside>
  );
}
