"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
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

      {/* Mobile Menu - Dropdown from top */}
      <div className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-background-primary/95 backdrop-blur-md border-b border-accent-secondary/20 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          isCollapsed={false}
          toggleCollapse={toggleCollapse}
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar
            isSidebarOpen={true}
            isCollapsed={isCollapsed}
            toggleCollapse={toggleCollapse}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <main className={`flex-1 p-4 pt-20 md:pl-0 md:pr-6 md:py-6 transition-all duration-500 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
