"use client";

import { useState } from "react";
import { SerializableSurveyTemplate } from "@eptss/data-access/services/surveyTemplateService";
import {
  deleteSurveyTemplateAction,
  toggleSurveyTemplateStatusAction,
  duplicateSurveyTemplateAction,
} from "@eptss/actions";
import { Button, Badge, Card, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@eptss/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SurveyTemplateListProps {
  templates: SerializableSurveyTemplate[];
}

export function SurveyTemplateList({ templates: initialTemplates }: SurveyTemplateListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const result = await toggleSurveyTemplateStatusAction(id, !currentStatus);

      if (result.status === 'success' && result.data) {
        setTemplates(prev =>
          prev.map(t => t.id === id ? result.data! : t)
        );
        toast({
          title: "Success",
          description: `Survey template ${!currentStatus ? 'activated' : 'deactivated'}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.errorMessage || "Failed to toggle status",
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
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    setDeletingId(templateToDelete);
    try {
      const result = await deleteSurveyTemplateAction(templateToDelete);

      if (result.status === 'success') {
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete));
        toast({
          title: "Success",
          description: "Survey template deleted",
        });
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
      } else {
        toast({
          title: "Error",
          description: result.errorMessage || "Failed to delete template",
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
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    setDuplicatingId(id);
    try {
      const result = await duplicateSurveyTemplateAction(id, `${name} (Copy)`);

      if (result.status === 'success' && result.data) {
        toast({
          title: "Success",
          description: "Survey template duplicated",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.errorMessage || "Failed to duplicate template",
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
      setDuplicatingId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id} variant="outline" className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-primary">
                    {template.name}
                  </h3>
                  <Badge variant={template.isActive ? "success" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {template.projectId && (
                    <Badge variant="outline">Project-specific</Badge>
                  )}
                  {!template.projectId && (
                    <Badge variant="default">Global</Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-secondary line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-secondary">
                  <span>
                    {template.questions.length} {template.questions.length === 1 ? 'question' : 'questions'}
                  </span>
                  <span>•</span>
                  <span>
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                  {template.creator && (
                    <>
                      <span>•</span>
                      <span>
                        by {template.creator.username}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/admin/surveys/${template.id}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>

                <Link href={`/admin/surveys/${template.id}/edit`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleStatus(template.id, template.isActive)}
                  disabled={togglingId === template.id}
                >
                  {togglingId === template.id ? "..." : template.isActive ? "Deactivate" : "Activate"}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicate(template.id, template.name)}
                  disabled={duplicatingId === template.id}
                >
                  {duplicatingId === template.id ? "..." : "Duplicate"}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openDeleteDialog(template.id)}
                  disabled={deletingId === template.id}
                  className="text-destructive hover:text-destructive"
                >
                  {deletingId === template.id ? "..." : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Survey Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this survey template? This will also delete
              any instances and responses associated with it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingId !== null}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
