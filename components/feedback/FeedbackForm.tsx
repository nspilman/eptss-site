"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { CreateFeedbackInput } from "@/data-access/feedbackService";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/primitives/form";
import Input from "@/components/ui/primitives/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { Button } from "@/components/ui/primitives";
import { Textarea } from "@/components/ui/primitives/textarea";
import { useToast } from "@/components/ui/use-toast";

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Feedback Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feedback type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-secondary">
                  Select the type of feedback you&apos;d like to provide.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Your Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you think..."
                    className="min-h-32 resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-secondary">
                  Please provide as much detail as possible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-primary">Make Public</FormLabel>
                  <FormDescription className="text-secondary">
                    Allow your feedback to be displayed publicly on our site.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            variant="secondary"
            size="full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
