"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AdminNavLink({ href, label, icon: Icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-secondary hover:text-primary hover:bg-background-secondary/50"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
