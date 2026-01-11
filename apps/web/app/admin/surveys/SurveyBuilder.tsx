"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSurveyTemplateAction, updateSurveyTemplateAction } from "@eptss/actions";
import type { SurveyQuestion, SurveyQuestionType } from "@eptss/data-access/types/survey";
import type { SerializableSurveyTemplate } from "@eptss/data-access/services/surveyTemplateService";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Switch,
  useToast,
  AlertBox,
} from "@eptss/ui";
// Using crypto.randomUUID() instead of uuid package

interface SurveyBuilderProps {
  existingTemplate?: SerializableSurveyTemplate;
}

const QUESTION_TYPES: { value: SurveyQuestionType; label: string; description: string }[] = [
  { value: "text", label: "Short Text", description: "Single line text input" },
  { value: "textarea", label: "Long Text", description: "Multi-line text input" },
  { value: "rating", label: "Rating", description: "Numeric rating scale" },
  { value: "multiple_choice", label: "Multiple Choice", description: "Select one option" },
  { value: "checkboxes", label: "Checkboxes", description: "Select multiple options" },
];

export function SurveyBuilder({ existingTemplate }: SurveyBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(existingTemplate?.name || "");
  const [description, setDescription] = useState(existingTemplate?.description || "");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(existingTemplate?.questions || []);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Add a new question
  const addQuestion = (type: SurveyQuestionType) => {
    const newQuestion: SurveyQuestion = {
      id: crypto.randomUUID(),
      type,
      question: "",
      required: true,
      order: questions.length,
      ...(type === "text" && { placeholder: "" }),
      ...(type === "textarea" && { placeholder: "", rows: 4 }),
      ...(type === "rating" && { minValue: 1, maxValue: 5, minLabel: "", maxLabel: "" }),
      ...(type === "multiple_choice" && { options: [{ id: crypto.randomUUID(), label: "" }, { id: crypto.randomUUID(), label: "" }], allowOther: false }),
      ...(type === "checkboxes" && { options: [{ id: crypto.randomUUID(), label: "" }, { id: crypto.randomUUID(), label: "" }], allowOther: false }),
    } as SurveyQuestion;

    setQuestions([...questions, newQuestion]);
    setEditingQuestionId(newQuestion.id);
  };

  // Update a question
  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  // Delete a question
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
  };

  // Move question up/down
  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }

    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

    // Update order numbers
    newQuestions.forEach((q, i) => {
      q.order = i;
    });

    setQuestions(newQuestions);
  };

  // Add option to multiple choice/checkbox question
  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || (question.type !== 'multiple_choice' && question.type !== 'checkboxes')) return;

    const newOption = { id: crypto.randomUUID(), label: "" };
    updateQuestion(questionId, {
      options: [...question.options, newOption],
    } as any);
  };

  // Update option label
  const updateOption = (questionId: string, optionId: string, label: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || (question.type !== 'multiple_choice' && question.type !== 'checkboxes')) return;

    updateQuestion(questionId, {
      options: question.options.map(o => o.id === optionId ? { ...o, label } : o),
    } as any);
  };

  // Delete option
  const deleteOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || (question.type !== 'multiple_choice' && question.type !== 'checkboxes')) return;

    if (question.options.length <= 2) {
      toast({
        title: "Cannot delete",
        description: "Questions must have at least 2 options",
        variant: "destructive",
      });
      return;
    }

    updateQuestion(questionId, {
      options: question.options.filter(o => o.id !== optionId),
    } as any);
  };

  // Validate form
  const validate = (): string | null => {
    if (!name.trim()) return "Survey name is required";
    if (questions.length === 0) return "At least one question is required";

    for (const question of questions) {
      if (!question.question.trim()) return "All questions must have text";

      if (question.type === 'multiple_choice' || question.type === 'checkboxes') {
        const q = question as any;
        if (q.options.length < 2) return "Multiple choice and checkbox questions must have at least 2 options";
        if (q.options.some((o: any) => !o.label.trim())) return "All options must have labels";
      }
    }

    return null;
  };

  // Save survey
  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const input = {
        name,
        description: description || undefined,
        questions,
        isActive: true,
      };

      const result = existingTemplate
        ? await updateSurveyTemplateAction({ ...input, id: existingTemplate.id })
        : await createSurveyTemplateAction(input);

      if (result.status === 'success') {
        toast({
          title: "Success",
          description: `Survey template ${existingTemplate ? 'updated' : 'created'}`,
        });
        router.push('/admin/surveys');
      } else {
        toast({
          title: "Error",
          description: result.errorMessage || "Failed to save survey template",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Survey Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Round Feedback Survey"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this survey for?"
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions</CardTitle>
            <span className="text-sm text-secondary">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <AlertBox variant="info">
              Add questions using the buttons below. Each question can be customized with different types and options.
            </AlertBox>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isEditing={editingQuestionId === question.id}
                onEdit={() => setEditingQuestionId(question.id)}
                onUpdate={(updates) => updateQuestion(question.id, updates)}
                onDelete={() => deleteQuestion(question.id)}
                onMoveUp={() => moveQuestion(question.id, 'up')}
                onMoveDown={() => moveQuestion(question.id, 'down')}
                onAddOption={() => addOption(question.id)}
                onUpdateOption={(optionId, label) => updateOption(question.id, optionId, label)}
                onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
                isFirst={index === 0}
                isLast={index === questions.length - 1}
              />
            ))}
          </div>

          {/* Add Question Buttons */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Add Question:</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map((type) => (
                <Button
                  key={type.value}
                  size="sm"
                  variant="outline"
                  onClick={() => addQuestion(type.value)}
                  title={type.description}
                >
                  + {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/surveys')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? "Saving..." : existingTemplate ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddOption?: () => void;
  onUpdateOption?: (optionId: string, label: string) => void;
  onDeleteOption?: (optionId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function QuestionCard({
  question,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const questionTypeLabel = QUESTION_TYPES.find(t => t.value === question.type)?.label || question.type;

  return (
    <Card variant="outline" className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-secondary">Q{index + 1}</span>
              <Badge variant="outline">{questionTypeLabel}</Badge>
              {question.required && <Badge variant="default">Required</Badge>}
            </div>

            {!isEditing && question.question && (
              <p className="text-primary font-medium">{question.question}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onMoveUp} disabled={isFirst}>
              ↑
            </Button>
            <Button size="sm" variant="ghost" onClick={onMoveDown} disabled={isLast}>
              ↓
            </Button>
            <Button size="sm" variant="ghost" onClick={isEditing ? () => {} : onEdit}>
              {isEditing ? "✓" : "Edit"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
              Delete
            </Button>
          </div>
        </div>

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label>Question Text *</Label>
              <Input
                value={question.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                placeholder="Enter your question"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Input
                value={question.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Helper text for this question"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
              <Label>Required question</Label>
            </div>

            {/* Type-specific fields */}
            {(question.type === 'text' || question.type === 'textarea') && (
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={(question as any).placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value } as any)}
                  placeholder="Optional placeholder text"
                  className="mt-1"
                />
              </div>
            )}

            {question.type === 'textarea' && (
              <div>
                <Label>Rows</Label>
                <Input
                  type="number"
                  value={(question as any).rows || 4}
                  onChange={(e) => onUpdate({ rows: parseInt(e.target.value) } as any)}
                  min={2}
                  max={20}
                  className="mt-1"
                />
              </div>
            )}

            {question.type === 'rating' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={(question as any).minValue || 1}
                    onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) } as any)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={(question as any).maxValue || 5}
                    onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) } as any)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Min Label (optional)</Label>
                  <Input
                    value={(question as any).minLabel || ""}
                    onChange={(e) => onUpdate({ minLabel: e.target.value } as any)}
                    placeholder="e.g., Poor"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Label (optional)</Label>
                  <Input
                    value={(question as any).maxLabel || ""}
                    onChange={(e) => onUpdate({ maxLabel: e.target.value } as any)}
                    placeholder="e.g., Excellent"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
              <div className="space-y-2">
                <Label>Options</Label>
                {(question as any).options.map((option: any, idx: number) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <span className="text-sm text-secondary w-6">{idx + 1}.</span>
                    <Input
                      value={option.label}
                      onChange={(e) => onUpdateOption?.(option.id, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteOption?.(option.id)}
                      disabled={(question as any).options.length <= 2}
                      className="text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={onAddOption}>
                  + Add Option
                </Button>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={(question as any).allowOther || false}
                    onCheckedChange={(checked) => onUpdate({ allowOther: checked } as any)}
                  />
                  <Label>Allow "Other" with text input</Label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Mode */}
        {!isEditing && (
          <div className="text-sm text-secondary pt-2 border-t">
            {question.description && <p className="mb-2">{question.description}</p>}

            {question.type === 'rating' && (
              <div className="flex items-center gap-2">
                <span>{(question as any).minLabel || (question as any).minValue}</span>
                <div className="flex gap-1">
                  {Array.from({ length: (question as any).maxValue - (question as any).minValue + 1 }).map((_, i) => (
                    <div key={i} className="w-8 h-8 border rounded flex items-center justify-center">
                      {(question as any).minValue + i}
                    </div>
                  ))}
                </div>
                <span>{(question as any).maxLabel || (question as any).maxValue}</span>
              </div>
            )}

            {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
              <ul className="space-y-1">
                {(question as any).options.map((option: any) => (
                  <li key={option.id} className="flex items-center gap-2">
                    {question.type === 'multiple_choice' ? '○' : '☐'} {option.label}
                  </li>
                ))}
                {(question as any).allowOther && <li className="flex items-center gap-2">Other: ___________</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
