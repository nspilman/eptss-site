import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eptss/ui";

export function ActivityCard({ 
    title, 
    count, 
    description, 
    linkText, 
    onClick 
  }: { 
    title: string; 
    count: number; 
    description: string; 
    linkText: string; 
    onClick: () => void; 
  }) {
    return (
      <Card className="shadow-[0px_0px_3px_3px_var(--color-accent-primary)] transition-all duration-300 hover:shadow-[0px_0px_5px_5px_var(--color-accent-primary)]">
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
          <CardDescription className="text-accent-secondary">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary mb-4">{count}</p>
          <button 
            onClick={onClick}
            className="text-sm text-accent-primary hover:underline"
          >
            {linkText}
          </button>
        </CardContent>
      </Card>
    );
  }
  