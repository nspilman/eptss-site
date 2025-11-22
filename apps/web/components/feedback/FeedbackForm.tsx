"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { CreateFeedbackInput } from "@eptss/data-access";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FormCheckboxField,
} from "@eptss/ui";
import { Button } from "@eptss/ui";
import { Textarea } from "@eptss/ui";
import { useToast } from "@eptss/ui";

// Define the form schema with Zod
const formSchema = z.object({
  type: z.enum(["review", "bug_report", "feature_request", "general"], {
    required_error: "Please select a feedback type",
  }),
  content: z.string().min(5, {
    message: "Feedback content must be at least 5 characters",
  }),
  isPublic: z.boolean().default(false),
});

// Feedback form props
interface FeedbackFormProps {
  userId?: string;
  onSuccess?: () => void;
  createFeedback: (input: CreateFeedbackInput) => Promise<any>;
}

export function FeedbackForm({ userId, onSuccess, createFeedback }: FeedbackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Avoid SSR for Radix Select to prevent hydration ID mismatches
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "general",
      content: "",
      isPublic: false,
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Call the server action with the form values
      const result = await createFeedback({
        type: values.type,
        content: values.content,
        userId: userId,
        isPublic: values.isPublic,
      });

      if (result.status === "success") {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback!",
        });
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Error",
          description: result.errorMessage || "Failed to submit feedback",
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
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6"
          aria-label="Feedback submission form"
          role="form"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary" htmlFor="feedback-type">Feedback Type</FormLabel>
                {mounted ? (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    aria-required="true"
                    aria-describedby="feedback-type-description"
                  >
                    <FormControl>
                      <SelectTrigger id="feedback-type">
                        <SelectValue placeholder="Select a feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="review" aria-label="Review">Review</SelectItem>
                      <SelectItem value="bug_report" aria-label="Bug Report">Bug Report</SelectItem>
                      <SelectItem value="feature_request" aria-label="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="general" aria-label="General Feedback">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <div
                      id="feedback-type"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                      aria-required="true"
                      aria-describedby="feedback-type-description"
                      aria-disabled="true"
                    >
                      Loading...
                    </div>
                  </FormControl>
                )}
                <FormDescription className="text-secondary" id="feedback-type-description">
                  Select the type of feedback you&apos;d like to provide.
                </FormDescription>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary" htmlFor="feedback-content">Your Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    id="feedback-content"
                    placeholder="Tell us what you think..."
                    className="min-h-32 resize-y"
                    aria-required="true"
                    aria-describedby="feedback-content-description"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-secondary" id="feedback-content-description">
                  Please provide as much detail as possible.
                </FormDescription>
                <FormMessage aria-live="polite" />
              </FormItem>
            )}
          />

          <FormCheckboxField
            control={form.control}
            name="isPublic"
            label="Make Public"
            description="Allow your feedback to be displayed publicly on our site."
          />

          <Button 
            type="submit" 
            variant="secondary"
            size="full"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            aria-label={isSubmitting ? "Submitting feedback" : "Submit feedback"}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
