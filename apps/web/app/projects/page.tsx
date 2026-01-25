import Link from "next/link";
import { Music, Vote, Trophy, Users, Sparkles } from "lucide-react";
import { getAllProjects } from "@eptss/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Display } from "@eptss/ui";

const iconMap = {
  music: Music,
  vote: Vote,
  trophy: Trophy,
  users: Users,
  sparkles: Sparkles,
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background-primary via-accent-primary/20 to-accent-secondary/20">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Display size="md" gradient className="mb-4">
            Our Projects
          </Display>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explore our music community projects. Each project brings together creators to collaborate and share their art.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const metadata = project.config?.metadata || {};
            const Icon = iconMap[metadata.icon as keyof typeof iconMap] || Music;

            return (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group">
                <Card variant="glass" hover="lift" gradient>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="p-2 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20"
                        style={{
                          borderColor: metadata.accentColor || '#3b82f6',
                          borderWidth: '1px'
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color: metadata.accentColor || '#3b82f6' }} />
                      </div>
                      {project.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {metadata.description || "A music community project"}
                    </CardDescription>
                    {metadata.tagline && (
                      <p className="text-sm text-gray-500 italic mb-4">
                        "{metadata.tagline}"
                      </p>
                    )}
                    <Button variant="ghost" className="w-full group-hover:bg-accent-primary/10">
                      View Project →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No projects available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
