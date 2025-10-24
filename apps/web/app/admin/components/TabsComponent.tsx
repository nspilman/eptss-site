"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type Tab = {
  id: string;
  label: string;
};

type TabsComponentProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
};

export function TabsComponent({ tabs, activeTab, onTabChange }: TabsComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (tabId: string) => {
    // Call the onTabChange callback if provided
    if (onTabChange) {
      onTabChange(tabId);
    }

    // Create a new URLSearchParams object to preserve other params
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    
    // Update the tab parameter
    params.set("tab", tabId);
    
    // Preserve the slug parameter if it exists
    const slug = searchParams ? searchParams.get("slug") : null;
    if (slug) {
      params.set("slug", slug);
    }
    
    // Navigate to the new URL
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex space-x-1 bg-background-secondary/30 p-1 rounded-lg border border-background-tertiary/50 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? "bg-accent-primary text-white"
              : "text-primary hover:bg-background-tertiary/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
