"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Footer } from "@/components/Footer/Footer";
import { NotificationBell } from "@/components/notifications";
import { UserDropdown } from "@/components/UserDropdown";
import { Button } from "@eptss/ui";

export interface UserProfile {
  email: string;
  username: string | null;
  profilePictureUrl: string | null;
}

// Dashboard header that replaces the regular header's mobile menu button with our sidebar toggle
const DashboardHeader = ({
  toggleSidebar,
  isSidebarOpen,
  userProfile
}: {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  userProfile: UserProfile | null;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect, matching the main header's behavior
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Set initial scroll state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${mounted && isScrolled ? 'bg-background-primary/95 backdrop-blur-md shadow-lg' : 'bg-transparent'} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            {/* Mobile menu toggle button - replaces the hamburger in main header */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden mr-3"
              aria-label="Toggle dashboard menu"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            
            <Link href="/" className="flex items-center gap-2 group">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                Dashboard
              </h2>
            </Link>
          </div>

          {/* Notification Bell and User Dropdown */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            {userProfile && (
              <UserDropdown
                email={userProfile.email}
                username={userProfile.username}
                profilePictureUrl={userProfile.profilePictureUrl}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout({
  children,
  isAdmin = false,
  userProfile = null,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  userProfile?: UserProfile | null;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load collapsed state from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-background-primary via-accent-primary/20 to-accent-secondary/20 flex flex-col">
      {/* Custom dashboard header with integrated sidebar toggle */}
      <DashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} userProfile={userProfile} />

      {/* Mobile Menu - Dropdown from top */}
      <div className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-background-primary/95 backdrop-blur-md border-b border-accent-secondary/20 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          isCollapsed={false}
          toggleCollapse={toggleCollapse}
          onNavigate={() => setIsSidebarOpen(false)}
          isAdmin={isAdmin}
        />
      </div>

      {/* Container for sidebar and content */}
      <div className="flex flex-col w-full">
        <div className={`flex-1 pt-16 w-screen transition-all duration-500 ease-in-out ${isCollapsed ? 'md:grid md:grid-cols-[5rem_1fr]' : 'md:grid md:grid-cols-[16rem_1fr]'}`}>
          {/* Desktop Sidebar - Fixed positioning, extends to bottom */}
          <div className="hidden md:block relative">
            <div className="md:fixed md:left-0 md:top-16 md:bottom-0 md:h-[calc(100vh-4rem)] md:overflow-y-auto" style={{ width: isCollapsed ? '5rem' : '16rem' }}>
              <DashboardSidebar
                isSidebarOpen={true}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
                onNavigate={() => setIsSidebarOpen(false)}
                isAdmin={isAdmin}
              />
            </div>
            {/* Collapse/Expand Button with glow effect - On the right divider, Desktop only */}
            <div className="hidden md:block absolute -right-3 top-24 z-50 group/button">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="w-6 h-6 rounded-full bg-white border border-accent-secondary/20 hover:bg-white/90 text-black hover:text-black shadow-lg"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                )}
              </Button>
              {/* Glowing divider line on button hover */}
              <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-accent-secondary/20 transition-all duration-300 group-hover/button:shadow-[0_0_15px_4px_rgba(var(--color-accent-primary-rgb),0.7)] group-hover/button:bg-accent-primary pointer-events-none" style={{height: '100vh', top: '-6rem'}}></div>
            </div>
          </div>

          {/* Main Content Column - Grid automatically constrains this */}
          <div className="flex flex-col min-w-0">
            <main className="flex-1 p-4 md:pl-6 md:pr-6 md:py-2 min-w-0 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
        {/* Footer offset by sidebar width on desktop */}
        <div className={`transition-all duration-500 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
