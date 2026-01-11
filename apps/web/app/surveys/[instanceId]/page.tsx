import { Suspense } from "react";
import { Metadata } from 'next/types';
import { notFound } from "next/navigation";
import { getSurveyInstanceById } from "@eptss/data-access/services/surveyInstanceService";
import { getSurveyResponseByInstanceAndUser } from "@eptss/data-access/services/surveyResponseService";
import { getUser } from "@eptss/auth";
import { Card, AlertBox } from "@eptss/ui";
import { SurveyForm } from "./SurveyForm";

export const metadata: Metadata = {
  title: "Survey | EPTSS",
  description: "Complete a survey",
};

interface SurveyPageProps {
  params: {
    instanceId: string;
  };
}

async function SurveyContent({ instanceId }: { instanceId: string }) {
  // Get current user
  const user = await getUser();
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <AlertBox variant="warning">
          You must be logged in to complete surveys.
        </AlertBox>
      </div>
    );
  }

  // Get survey instance
  const instanceResult = await getSurveyInstanceById(instanceId);
  if (instanceResult.status !== 'success' || !instanceResult.data) {
    notFound();
  }

  const instance = instanceResult.data;

  // Check if survey is active
  if (instance.status !== 'active' && instance.status !== 'scheduled') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <AlertBox variant="info">
          This survey is no longer accepting responses.
        </AlertBox>
      </div>
    );
  }

  // Check if expired
  if (instance.expiresAt && new Date(instance.expiresAt) < new Date()) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <AlertBox variant="info">
          This survey has expired.
        </AlertBox>
      </div>
    );
  }

  // Check if user already responded
  const responseResult = await getSurveyResponseByInstanceAndUser(instanceId, user.id);
  const existingResponse = responseResult.status === 'success' ? responseResult.data : null;

  // If user already completed, show thank you
  if (existingResponse?.isComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card variant="glass" className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary">Thank You!</h2>
          <p className="text-secondary">
            You have already completed this survey. We appreciate your feedback!
          </p>
        </Card>
      </div>
    );
  }

  // Check if template exists
  if (!instance.template) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <AlertBox variant="error">
          Survey template not found.
        </AlertBox>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {instance.template.name}
          </h1>
          {instance.template.description && (
            <p className="text-secondary">
              {instance.template.description}
            </p>
          )}
        </div>

        {/* Info */}
        {instance.round && (
          <AlertBox variant="info" icon={false}>
            This survey is for <strong>Round {instance.round.slug}</strong>
          </AlertBox>
        )}

        {/* Survey Form */}
        <SurveyForm
          instance={instance}
          template={instance.template}
          existingResponse={existingResponse}
          userId={user.id}
        />
      </div>
    </div>
  );
}

export default function SurveyPage({ params }: SurveyPageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-12">
        <div className="h-96 bg-background-secondary/30 animate-pulse rounded" />
      </div>
    }>
      <SurveyContent instanceId={params.instanceId} />
    </Suspense>
  );
}
