"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Wrench, Music } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rounds", label: "Rounds", icon: Music },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all whitespace-nowrap ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-secondary hover:text-primary hover:bg-background-secondary/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
