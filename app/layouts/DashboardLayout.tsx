"use client";

import { Navigation } from "@/enum/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HomeIcon, HistoryIcon, UserIcon, MusicNoteIcon, ChatBubbleLeftEllipsisIcon } from "../../components/ui/icons";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ href, icon, label, isActive, onClick }: SidebarItemProps) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
      ${isActive 
        ? "bg-gradient-to-r from-[var(--color-accent-primary)]/50 to-[var(--color-accent-secondary)]/50 text-white" 
        : "hover:bg-background-secondary/30 text-accent-secondary hover:text-white"
      }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

// Dashboard header that replaces the regular header's mobile menu button with our sidebar toggle
const DashboardHeader = ({ toggleSidebar, isSidebarOpen }: { toggleSidebar: () => void, isSidebarOpen: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect, matching the main header's behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-background-primary/95 backdrop-blur-md shadow-lg' : 'bg-transparent'} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            {/* Mobile menu toggle button - replaces the hamburger in main header */}
            <button 
              onClick={toggleSidebar}
              className="md:hidden mr-3 text-accent-secondary hover:text-accent-primary transition-colors"
              aria-label="Toggle dashboard menu"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <Link href="/" className="flex items-center gap-2 group">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                Dashboard
              </h2>
            </Link>
          </div>

          {/* Empty div to match header layout */}
          <div className="hidden md:block"></div>
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-accent-primary/20 to-accent-secondary/20">
      {/* Replace header's mobile menu button with our own */}
      <style jsx global>{`
        /* Hide the main site header completely on dashboard pages */
        body > div > header:first-of-type {
          display: none;
        }
      `}</style>

      {/* Custom dashboard header with integrated sidebar toggle */}
      <DashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex">
        {/* Sidebar - hidden on mobile by default, shown when toggled or on md+ screens */}
        <aside 
          className={`w-64 min-h-screen bg-background-primary/50 backdrop-blur-xs border-r border-accent-secondary/20 p-4 fixed z-40 transition-transform duration-300 ease-in-out md:translate-x-0 pt-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <nav className="space-y-2">
            <SidebarItem 
              href={Navigation.Dashboard}
              icon={<HomeIcon className="w-5 h-5" />}
              label="Dashboard"
              isActive={pathname === Navigation.Dashboard}
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem 
              href="/round/current"
              icon={<MusicNoteIcon className="w-5 h-5" />}
              label="Current Round"
              isActive={pathname === "/round/current"}
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem 
              href="/rounds"
              icon={<HistoryIcon className="w-5 h-5" />}
              label="Past Rounds"
              isActive={pathname === "/rounds"}
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem 
              href="/profile" 
              icon={<UserIcon className="w-5 h-5" />}
              label="Profile"
              isActive={pathname === "/profile"}
              onClick={() => setIsSidebarOpen(false)}
            />
            <SidebarItem 
              href="/feedback" 
              icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />}
              label="Feedback"
              isActive={pathname === "/feedback"}
              onClick={() => setIsSidebarOpen(false)}
            />
          </nav>
        </aside>

        {/* Main Content - adjusted padding on mobile, margin on larger screens */}
        <main className="flex-1 p-4 pt-20 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
