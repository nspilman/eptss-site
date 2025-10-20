"use client";

import { Navigation } from "@/enum/navigation";
import Link from "next/link";
import { HomeIcon, HistoryIcon, UserIcon, MusicNoteIcon, ChatBubbleLeftEllipsisIcon } from "../../components/ui/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    title={isCollapsed ? label : undefined}
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
}

export function DashboardSidebar({ isSidebarOpen, isCollapsed, toggleCollapse, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={`bg-background-primary/50 backdrop-blur-xs h-full px-3 py-4 transition-all duration-500 ease-in-out md:border-r md:border-accent-secondary/20 md:z-40 md:pt-20 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
    >
      {/* Collapse/Expand Button with glow effect - On the right divider, Desktop only */}
      <div className="hidden md:block absolute -right-3 top-24 z-50 group/button ">
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-accent-secondary/20 hover:bg-white/90 text-black hover:text-black transition-colors shadow-lg cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 stroke-[3]" /> : <ChevronLeft className="w-4 h-4 stroke-[3]" />}
        </button>
        {/* Glowing divider line on button hover */}
        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-accent-secondary/20 transition-all duration-300 group-hover/button:shadow-[0_0_15px_4px_rgba(var(--color-accent-primary-rgb),0.7)] group-hover/button:bg-accent-primary pointer-events-none" style={{height: '100vh', top: '-6rem'}}></div>
      </div>
      
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
          href="/rounds"
          icon={<HistoryIcon className="w-5 h-5" />}
          label="Past Rounds"
          isActive={pathname === "/rounds"}
          onClick={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          href="/profile" 
          icon={<UserIcon className="w-5 h-5" />}
          label="Profile"
          isActive={pathname === "/profile"}
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
      </nav>
    </aside>
  );
}
