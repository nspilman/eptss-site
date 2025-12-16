import { ChevronDown, ChevronRight } from "lucide-react";

interface ConfigSectionProps {
  id?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: "purple" | "pink" | "orange" | "green" | "blue" | "default";
  icon?: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function ConfigSection({
  id,
  title,
  description,
  children,
  variant = "default",
  icon,
  isCollapsed = false,
  onToggle,
}: ConfigSectionProps) {
  const variantStyles = {
    purple: "bg-purple-500/5 border-2 border-purple-500/20 hover:border-purple-500/40",
    pink: "bg-pink-500/5 border-2 border-pink-500/20 hover:border-pink-500/40",
    orange: "bg-orange-500/5 border-2 border-orange-500/20 hover:border-orange-500/40",
    green: "bg-green-500/5 border-2 border-green-500/20 hover:border-green-500/40",
    blue: "bg-blue-500/5 border-2 border-blue-500/20 hover:border-blue-500/40",
    default: "bg-background-secondary border-2 border-border",
  };

  const iconColors = {
    purple: "text-purple-500",
    pink: "text-pink-500",
    orange: "text-orange-500",
    green: "text-green-500",
    blue: "text-blue-500",
    default: "text-primary",
  };

  return (
    <div id={id} className={`${variantStyles[variant]} rounded-xl transition-all duration-200 shadow-sm hover:shadow-md scroll-mt-8`}>
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-t-xl"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className={iconColors[variant]}>{icon}</span>}
            <h3 className="text-lg font-bold">{title}</h3>
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-secondary" />
            )}
          </div>
          <p className="text-sm text-secondary">{description}</p>
        </div>
      </button>
      {!isCollapsed && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}
