"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, SectionHeader, AlertBox } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui"
import { signupSchema, signupSchemaNoSong, nonLoggedInSchema, nonLoggedInSchemaNoSong, type SignupFormValues, type NonLoggedInSignupFormValues } from "@eptss/core/schemas/signupSchemas"
import { useState } from "react"
import { EmailConfirmationScreen } from "./EmailConfirmationScreen"
import { useRouter, useParams } from "next/navigation"
import { UserSignupData } from "@eptss/core/types/signup"
import { routes } from "@eptss/routing"
import { Mail } from "lucide-react"


interface SignupFormProps {
  roundId: number;
  signupsCloseDateLabel: string;
  title: string;
  onSuccess?: () => void;
  isLoggedIn?: boolean;
  isUpdate?: boolean;
  existingSignup?: UserSignupData;
  referralCode?: string;
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: (formData: FormData) => Promise<FormReturn>;
  requireSongOnSignup?: boolean;
  loggedInWelcomeText: string;
  projectDescription: string;
}

// Base fields for all users
const baseFormFields: FieldConfig[] = [
  {
    type: "input",
    name: "songTitle",
    label: "Song Title",
    placeholder: "Enter the song title",
  },
  {
    type: "input",
    name: "artist",
    label: "Artist",
    placeholder: "Enter the artist name",
  },
  {
    type: "input",
    name: "youtubeLink",
    label: "YouTube Link",
    placeholder: "Paste the YouTube URL",
    inputType: "url",
    description: "Link to the song on YouTube",
  },
];

// Additional fields for non-logged in users
const getNonLoggedInFields = (referralCode?: string): FieldConfig[] => [
  {
    type: "input",
    name: "email",
    label: "Email *",
    placeholder: "Enter your email address",
    inputType: "email",
    description: "We'll send you a verification link",
  },
  {
    type: "input",
    name: "name",
    label: "Name *",
    placeholder: "Enter your name",
  },
  {
    type: "input",
    name: "location",
    label: "Location (optional)",
    placeholder: "Enter your location",
    description: "City, State, Country",
  },
  {
    type: "input",
    name: "referralCode",
    label: "Referral Code *",
    placeholder: "Enter your referral code",
    description: referralCode
      ? "Referral code detected from link"
      : "Required - Ask an existing member for an invite link",
    disabled: !!referralCode,
  },
];

export function SignupForm({
  roundId,
  signupsCloseDateLabel,
  title,
  onSuccess,
  isLoggedIn = false,
  isUpdate = false,
  existingSignup,
  referralCode,
  signup,
  signupWithOTP,
  requireSongOnSignup = true,
  loggedInWelcomeText,
  projectDescription,
}: SignupFormProps) {
  // State to track if the form has been submitted (for non-logged in users)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const router = useRouter();
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  // Determine which schema and fields to use based on login status and requireSongOnSignup
  console.log('[SignupForm] requireSongOnSignup:', requireSongOnSignup, 'isLoggedIn:', isLoggedIn);
  const schema = requireSongOnSignup
    ? (isLoggedIn ? signupSchema : nonLoggedInSchema)
    : (isLoggedIn ? signupSchemaNoSong : nonLoggedInSchemaNoSong);
  console.log('[SignupForm] Selected schema:', requireSongOnSignup ? 'WITH song' : 'WITHOUT song', isLoggedIn ? '(logged in)' : '(not logged in)');

  // Filter out song fields if not required
  const filteredBaseFields = requireSongOnSignup
    ? baseFormFields
    : baseFormFields.filter(field =>
        !['songTitle', 'artist', 'youtubeLink'].includes(field.name)
      );

  const formFields = isLoggedIn
    ? filteredBaseFields
    : [...getNonLoggedInFields(referralCode), ...filteredBaseFields];
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      songTitle: existingSignup?.songTitle || "",
      artist: existingSignup?.artist || "",
      youtubeLink: existingSignup?.youtubeLink || "",
      email: "",
      name: "",
      location: "",
      referralCode: referralCode || "",
      roundId,
    },
    mode: "onChange",
    reValidateMode: "onChange"
  })

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    // Use the appropriate signup method based on login status
    if (isLoggedIn) {
      return await signup(formData);
    } else {
      // Save the email for the confirmation screen
      const email = formData.get("email") as string;
      if (email) {
        setSubmittedEmail(email);
      }

      return await signupWithOTP(formData);
    }
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    onSuccess: () => {
      if (!isLoggedIn) {
        setIsSubmitted(true);
      } else if (isUpdate) {
        // For updates, redirect to the project dashboard
        router.push(routes.projects.dashboard(projectSlug));
      } else {
        // For new signups, redirect to the project dashboard
        router.push(routes.projects.dashboard(projectSlug));
      }
    },
    successMessage: isLoggedIn
      ? isUpdate
        ? "You've successfully updated your song for this round!"
        : "You've successfully signed up for Everyone Plays the Same Song!"
      : "Please check your email for a verification link to complete your signup.",
  })

  // If the form has been submitted and the user is not logged in, show the confirmation screen
  if (isSubmitted && !isLoggedIn) {
    return <EmailConfirmationScreen email={submittedEmail} roundId={roundId} projectSlug={projectSlug} />;
  }
  
  return (
    <FormWrapper
      title={title}
      description={`Signups close ${signupsCloseDateLabel}${!isLoggedIn ? ' - Please provide your email to sign up' : ''}`}
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <input type="hidden" name="roundId" value={roundId} />

          {/* Project description blurb */}
          <div className="rounded-lg bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 p-6 backdrop-blur-sm border border-accent-primary/20">
            <p className="text-sm text-gray-200 leading-relaxed">
              {projectDescription}
            </p>
          </div>

          {isLoggedIn && (
            <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm border border-accent-primary/30">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Welcome Back! 👋
                </h3>
                <p className="text-sm text-muted-foreground">
                  {loggedInWelcomeText}
                </p>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm">
              <SectionHeader
                variant="accent-border"
                borderColor="primary"
                size="sm"
                title="Your Information"
                className="mb-6"
              />
              <div>
                <FormBuilder
                  fields={getNonLoggedInFields(referralCode)}
                  control={form.control}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {requireSongOnSignup && (
            <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm">
              <SectionHeader
                variant="accent-border"
                borderColor="secondary"
                size="sm"
                title="Round Signup"
                className="mb-6"
              />
              <div>
                <FormBuilder
                  fields={baseFormFields.filter(field => ['songTitle', 'artist', 'youtubeLink'].includes(field.name))}
                  control={form.control}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Helper text for non-logged-in users */}
          {!isLoggedIn && (
            <AlertBox variant="info" icon={<Mail className="h-5 w-5" />}>
              After clicking, we'll send a verification email to complete your signup
            </AlertBox>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            variant="gradient"
            size="full"
            className="py-3 text-lg font-semibold text-black"
          >
            {isLoading
              ? (isUpdate ? "Updating..." : (isLoggedIn ? "Signing up..." : "Sending email..."))
              : (isUpdate ? "Update Song" : (isLoggedIn ? "Sign Up" : "Continue via Email"))
            }
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
