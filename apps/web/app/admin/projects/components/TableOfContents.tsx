import { BookOpen, ToggleLeft, Palette, Shield, Mail, Zap } from "lucide-react";

interface TableOfContentsProps {
  onNavigate: (sectionId: string) => void;
}

const sectionStyles = {
  features: {
    button: "hover:bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    text: "text-purple-600 dark:text-purple-400",
  },
  design: {
    button: "hover:bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40",
    text: "text-pink-600 dark:text-pink-400",
  },
  rules: {
    button: "hover:bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40",
    text: "text-orange-600 dark:text-orange-400",
  },
  communication: {
    button: "hover:bg-green-500/10 border-green-500/20 hover:border-green-500/40",
    text: "text-green-600 dark:text-green-400",
  },
  automation: {
    button: "hover:bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  content: {
    button: "hover:bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
    text: "text-cyan-600 dark:text-cyan-400",
  },
} as const;

export function TableOfContents({ onNavigate }: TableOfContentsProps) {
  const sections = [
    { id: 'features' as const, label: 'Features', icon: ToggleLeft },
    { id: 'design' as const, label: 'Design', icon: Palette },
    { id: 'rules' as const, label: 'Rules', icon: Shield },
    { id: 'communication' as const, label: 'Communication', icon: Mail },
    { id: 'automation' as const, label: 'Automation', icon: Zap },
    { id: 'content' as const, label: 'Content', icon: BookOpen },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-border rounded-xl p-6 sticky top-4 z-10 shadow-lg">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        Quick Navigation
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sections.map(({ id, label, icon: Icon }) => {
          const styles = sectionStyles[id];
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`text-left px-3 py-2 rounded-lg border transition-colors ${styles.button}`}
            >
              <div className={`flex items-center gap-2 font-medium text-sm ${styles.text}`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
