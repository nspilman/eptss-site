"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SurveyQuestion, SurveyAnswer } from "@eptss/data-access/types/survey";
import type { SerializableSurveyTemplate } from "@eptss/data-access/services/surveyTemplateService";
import type { SerializableSurveyInstance } from "@eptss/data-access/services/surveyInstanceService";
import type { SerializableSurveyResponse } from "@eptss/data-access/services/surveyResponseService";
import { saveSurveyResponseAction } from "@eptss/actions";
import {
  Button,
  Card,
  CardContent,
  Label,
  Input,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Progress,
  useToast,
  AlertBox,
} from "@eptss/ui";

interface SurveyFormProps {
  instance: SerializableSurveyInstance;
  template: SerializableSurveyTemplate;
  existingResponse: SerializableSurveyResponse | null;
  userId: string;
}

export function SurveyForm({ instance, template, existingResponse, userId }: SurveyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, any>>(
    existingResponse?.answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer;
      return acc;
    }, {} as Record<string, any>) || {}
  );
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = template.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        handleSave(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [answers]);

  // Update answer
  const updateAnswer = (questionId: string, answerData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerData,
    }));
  };

  // Convert answers object to array format
  const getAnswersArray = (): SurveyAnswer[] => {
    return Object.values(answers).filter(Boolean) as SurveyAnswer[];
  };

  // Validate required questions
  const validateAnswers = (): string | null => {
    const requiredQuestions = template.questions.filter(q => q.required);
    const answeredQuestionIds = new Set(Object.keys(answers));

    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.has(question.id)) {
        return `Please answer: "${question.question}"`;
      }

      const answer = answers[question.id];

      // Check if answer has actual content
      if (question.type === 'text' || question.type === 'textarea') {
        if (!answer.value || answer.value.trim() === '') {
          return `Please answer: "${question.question}"`;
        }
      } else if (question.type === 'checkboxes') {
        if (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
          return `Please select at least one option for: "${question.question}"`;
        }
      }
    }

    return null;
  };

  // Save (draft or submit)
  const handleSave = async (isComplete: boolean) => {
    if (isComplete) {
      const error = validateAnswers();
      if (error) {
        toast({
          title: "Incomplete Survey",
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    if (isComplete) {
      setSaving(true);
    } else {
      setAutoSaving(true);
    }

    try {
      const result = await saveSurveyResponseAction({
        instanceId: instance.id,
        userId,
        roundId: instance.roundId,
        answers: getAnswersArray(),
        isComplete,
      });

      if (result.status === 'success') {
        if (isComplete) {
          toast({
            title: "Thank you!",
            description: "Your survey response has been submitted.",
          });
          router.push('/dashboard');
        } else if (!autoSaving) {
          toast({
            title: "Draft saved",
            description: "Your progress has been saved.",
          });
        }
      } else {
        if (isComplete) {
          toast({
            title: "Error",
            description: result.errorMessage || "Failed to submit survey",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      if (isComplete) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
      setAutoSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card variant="outline" className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Progress</span>
            <span className="font-medium">{answeredCount} of {totalQuestions} questions</span>
          </div>
          <Progress value={progress} />
        </div>
      </Card>

      {/* Auto-save indicator */}
      {autoSaving && (
        <AlertBox variant="info">
          Saving draft...
        </AlertBox>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {template.questions.map((question, index) => (
          <Card key={question.id} variant="glass" className="p-6">
            <div className="space-y-4">
              {/* Question Header */}
              <div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-secondary">Q{index + 1}</span>
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      {question.question}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {question.description && (
                      <p className="text-sm text-secondary mt-1">{question.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Input */}
              <QuestionInput
                question={question}
                value={answers[question.id]}
                onChange={(value) => updateAnswer(question.id, value)}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card variant="outline" className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving || autoSaving || Object.keys(answers).length === 0}
          >
            Save Draft
          </Button>

          <Button
            onClick={() => handleSave(true)}
            disabled={saving || autoSaving}
            size="lg"
          >
            {saving ? "Submitting..." : "Submit Survey"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Question Input Component
interface QuestionInputProps {
  question: SurveyQuestion;
  value: any;
  onChange: (value: any) => void;
}

function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const [otherText, setOtherText] = useState(value?.otherValue || "");

  if (question.type === 'text') {
    return (
      <Input
        value={value?.value || ""}
        onChange={(e) => onChange({
          questionId: question.id,
          type: 'text',
          value: e.target.value,
        })}
        placeholder={(question as any).placeholder || "Your answer"}
        maxLength={(question as any).maxLength}
      />
    );
  }

  if (question.type === 'textarea') {
    return (
      <Textarea
        value={value?.value || ""}
        onChange={(e) => onChange({
          questionId: question.id,
          type: 'textarea',
          value: e.target.value,
        })}
        placeholder={(question as any).placeholder || "Your answer"}
        rows={(question as any).rows || 4}
        maxLength={(question as any).maxLength}
      />
    );
  }

  if (question.type === 'rating') {
    const q = question as any;
    const ratings = Array.from(
      { length: q.maxValue - q.minValue + 1 },
      (_, i) => q.minValue + i
    );

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-secondary">
          {q.minLabel && <span>{q.minLabel}</span>}
          {q.maxLabel && <span>{q.maxLabel}</span>}
        </div>
        <div className="flex gap-2 justify-center">
          {ratings.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange({
                questionId: question.id,
                type: 'rating',
                value: rating,
              })}
              className={`w-12 h-12 rounded border-2 font-semibold transition-colors ${
                value?.value === rating
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'multiple_choice') {
    const q = question as any;
    const selectedOption = value?.selectedOptionId;

    return (
      <div className="space-y-3">
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={(optionId) => {
            onChange({
              questionId: question.id,
              type: 'multiple_choice',
              selectedOptionId: optionId,
              otherValue: optionId === 'other' ? otherText : undefined,
            });
          }}
        >
          {q.options.map((option: any) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
              <Label htmlFor={`${question.id}-${option.id}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}

          {q.allowOther && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id={`${question.id}-other`} />
                <Label htmlFor={`${question.id}-other`} className="font-normal cursor-pointer">
                  Other
                </Label>
              </div>
              {selectedOption === 'other' && (
                <Input
                  value={otherText}
                  onChange={(e) => {
                    setOtherText(e.target.value);
                    onChange({
                      questionId: question.id,
                      type: 'multiple_choice',
                      selectedOptionId: 'other',
                      otherValue: e.target.value,
                    });
                  }}
                  placeholder="Please specify"
                  className="ml-6"
                />
              )}
            </div>
          )}
        </RadioGroup>
      </div>
    );
  }

  if (question.type === 'checkboxes') {
    const q = question as any;
    const selectedOptions = value?.selectedOptionIds || [];

    const toggleOption = (optionId: string) => {
      const newSelected = selectedOptions.includes(optionId)
        ? selectedOptions.filter((id: string) => id !== optionId)
        : [...selectedOptions, optionId];

      onChange({
        questionId: question.id,
        type: 'checkboxes',
        selectedOptionIds: newSelected,
        otherValue: newSelected.includes('other') ? otherText : undefined,
      });
    };

    return (
      <div className="space-y-3">
        {q.options.map((option: any) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${question.id}-${option.id}`}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={() => toggleOption(option.id)}
            />
            <Label htmlFor={`${question.id}-${option.id}`} className="font-normal cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}

        {q.allowOther && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-other`}
                checked={selectedOptions.includes('other')}
                onCheckedChange={() => toggleOption('other')}
              />
              <Label htmlFor={`${question.id}-other`} className="font-normal cursor-pointer">
                Other
              </Label>
            </div>
            {selectedOptions.includes('other') && (
              <Input
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  onChange({
                    questionId: question.id,
                    type: 'checkboxes',
                    selectedOptionIds: selectedOptions,
                    otherValue: e.target.value,
                  });
                }}
                placeholder="Please specify"
                className="ml-6"
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
