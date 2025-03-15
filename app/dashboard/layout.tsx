import { Navigation } from "@/enum/navigation";
import Link from "next/link";
import { HomeIcon, HistoryIcon, ChecklistIcon, UserIcon, MusicNoteIcon } from "../../components/ui/icons";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const SidebarItem = ({ href, icon, label, isActive }: SidebarItemProps) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
      ${isActive 
        ? "bg-linear-to-r from-purple-900/50 to-blue-900/50 text-white" 
        : "hover:bg-gray-800/30 text-gray-400 hover:text-white"
      }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-gray-900/50 backdrop-blur-xs border-r border-gray-800 p-4 fixed">
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-blue-400">
              EPTSS
            </h2>
          </div>
          <nav className="space-y-2">
            <SidebarItem 
              href={Navigation.Dashboard} 
              icon={<HomeIcon className="w-5 h-5" />}
              label="Dashboard"
              isActive
            />
            <SidebarItem 
              href="/round/current" 
              icon={<MusicNoteIcon className="w-5 h-5" />}
              label="Current Round"
            />
            <SidebarItem 
              href="/rounds" 
              icon={<HistoryIcon className="w-5 h-5" />}
              label="Past Rounds"
            />
            {/* <SidebarItem 
              href="/tasks" 
              icon={<ChecklistIcon className="w-5 h-5" />}
              label="Tasks"
            />
            <SidebarItem 
              href="/profile" 
              icon={<UserIcon className="w-5 h-5" />}
              label="Profile"
            /> */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
