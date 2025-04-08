type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

export const StatItem = ({ title, value, icon, isActive, onClick }: Props) => (
  <div 
    className={`p-4 rounded-lg border transition-colors ${
      isActive 
        ? 'bg-background-secondary border-accent-primary/50' 
        : 'bg-background-secondary/50 border-background-tertiary/50 hover:bg-background-secondary/70'
    } ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-secondary">{title}</h3>
      <div className={isActive ? 'text-accent-primary' : 'text-accent-primary/70'}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-primary">{value}</p>
  </div>
);