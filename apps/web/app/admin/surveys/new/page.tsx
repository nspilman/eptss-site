import { Metadata } from 'next/types';
import { SurveyBuilder } from "../SurveyBuilder";

export const metadata: Metadata = {
  title: "Create Survey Template | Admin",
  description: "Create a new survey template",
};

export default function NewSurveyPage() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Create Survey Template</h2>
        <p className="text-secondary">
          Build a reusable survey template that can be sent to users after rounds end
        </p>
      </div>

      <SurveyBuilder />
    </div>
  );
}
