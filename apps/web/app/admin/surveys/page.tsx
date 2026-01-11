import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getAllSurveyTemplates } from "@eptss/data-access/services/surveyTemplateService";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge, AlertBox, EmptyState } from "@eptss/ui";
import Link from "next/link";
import { SurveyTemplateList } from "./SurveyTemplateList";

export const metadata: Metadata = {
  title: "Survey Management | Admin",
  description: "Manage survey templates",
};

async function SurveysContent() {
  const templatesResult = await getAllSurveyTemplates({
    includeInactive: true,
    includeDeleted: false,
  });

  const templates = templatesResult.status === 'success' ? templatesResult.data : [];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Survey Management</h2>
          <p className="text-secondary">
            Create and manage survey templates for collecting user feedback
          </p>
        </div>
        <Link href="/admin/surveys/new">
          <Button size="lg">
            Create Survey Template
          </Button>
        </Link>
      </div>

      <AlertBox variant="info" icon={false}>
        <strong>How it works:</strong> Create reusable survey templates, then link them to specific rounds
        to automatically send surveys to users after the round ends.
      </AlertBox>

      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Survey Templates</CardTitle>
              <CardDescription>
                Reusable survey definitions that can be sent to users
              </CardDescription>
            </div>
            <span className="text-sm text-secondary">
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <EmptyState
              title="No survey templates yet"
              description="Create your first survey template to start collecting feedback from users."
              action={{
                label: "Create Survey Template",
                href: "/admin/surveys/new"
              }}
            />
          ) : (
            <SurveyTemplateList templates={templates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SurveysPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-20 bg-background-secondary/30 animate-pulse rounded" />
        <div className="h-96 bg-background-secondary/30 animate-pulse rounded" />
      </div>
    }>
      <SurveysContent />
    </Suspense>
  );
}
