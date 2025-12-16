"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form, SectionHeader } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui"
import { signupSchema, signupSchemaNoSong, nonLoggedInSchema, nonLoggedInSchemaNoSong, type SignupFormValues, type NonLoggedInSignupFormValues } from "@eptss/data-access/schemas/signupSchemas"
import { useState } from "react"
import { EmailConfirmationScreen } from "./EmailConfirmationScreen"
import { useRouter, useParams } from "next/navigation"
import { UserSignupData } from "@eptss/data-access/types/signup"
import { useCaptcha } from "@eptss/captcha"


interface SignupFormProps {
  roundId: number;
  signupsCloseDateLabel: string;
  onSuccess?: () => void;
  isLoggedIn?: boolean;
  isUpdate?: boolean;
  existingSignup?: UserSignupData;
  referralCode?: string;
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: (formData: FormData, captchaToken?: string) => Promise<FormReturn>;
  requireSongOnSignup?: boolean;
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
  {
    type: "textarea",
    name: "additionalComments",
    label: "Additional Comments",
    placeholder: "Any additional comments about your submission",
    description: "Optional: Add any notes about your submission",
  },
];

// Additional fields for non-logged in users
const getNonLoggedInFields = (referralCode?: string): FieldConfig[] => [
  {
    type: "input",
    name: "email",
    label: "Email",
    placeholder: "Enter your email address",
    inputType: "email",
    description: "We'll send you a verification link",
  },
  {
    type: "input",
    name: "name",
    label: "Name",
    placeholder: "Enter your name",
  },
  {
    type: "input",
    name: "location",
    label: "Location",
    placeholder: "Enter your location (optional)",
    description: "City, State, Country",
  },
  {
    type: "input",
    name: "referralCode",
    label: "Referral Code",
    placeholder: "Enter your referral code",
    description: referralCode
      ? "Referral code detected from link"
      : "A referral code is required. Ask an existing member for an invite link.",
    disabled: !!referralCode,
  },
];

export function SignupForm({
  roundId,
  signupsCloseDateLabel,
  onSuccess,
  isLoggedIn = false,
  isUpdate = false,
  existingSignup,
  referralCode,
  signup,
  signupWithOTP,
  requireSongOnSignup = true,
}: SignupFormProps) {
  // State to track if the form has been submitted (for non-logged in users)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const router = useRouter();
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  // Get CAPTCHA hook (only used for non-logged-in users)
  const { executeRecaptcha, isReady: isCaptchaReady } = useCaptcha();

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
      additionalComments: existingSignup?.additionalComments || "",
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
      // Execute CAPTCHA for non-logged-in users
      let captchaToken: string | null = null;

      try {
        captchaToken = await executeRecaptcha('signup');

        if (!captchaToken) {
          return {
            status: "Error",
            message: "Security verification failed. Please refresh the page and try again.",
            variant: "destructive",
          };
        }
      } catch (error) {
        console.error('[SignupForm] CAPTCHA execution error:', error);
        return {
          status: "Error",
          message: "Security verification error. Please try again.",
          variant: "destructive",
        };
      }

      // Save the email for the confirmation screen
      const email = formData.get("email") as string;
      if (email) {
        setSubmittedEmail(email);
      }

      // captchaToken is guaranteed to be a string here due to the check above
      return await signupWithOTP(formData, captchaToken as string);
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
        router.push(`/projects/${projectSlug}/dashboard`);
      } else {
        // For new signups, redirect to the project dashboard
        router.push(`/projects/${projectSlug}/dashboard`);
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
    return <EmailConfirmationScreen email={submittedEmail} roundId={roundId} />;
  }
  
  return (
    <FormWrapper 
      title={isUpdate 
        ? `Update Your Song for Round ${roundId}` 
        : `Sign Up for Everyone Plays the Same Song round ${roundId}`}
      description={`Signups close ${signupsCloseDateLabel}${!isLoggedIn ? ' - Please provide your email to sign up' : ''}`}
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <input type="hidden" name="roundId" value={roundId} />
          
          {!isLoggedIn && (
            <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm">
              <SectionHeader
                variant="accent-border"
                borderColor="primary"
                title="Your Information"
                subtitle="We'll send you a verification link to complete your signup"
                className="mb-6"
              />
              <div className="space-y-5">
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
                title="Round Signup"
                subtitle="Enter the song you'd like to cover for this round"
                className="mb-6"
              />
              <div className="space-y-5">
                <FormBuilder
                  fields={baseFormFields.filter(field => ['songTitle', 'artist', 'youtubeLink'].includes(field.name))}
                  control={form.control}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {filteredBaseFields.some(field => field.name === 'additionalComments') && (
            <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm">
              <div className="space-y-5">
                <FormBuilder
                  fields={baseFormFields.filter(field => field.name === 'additionalComments')}
                  control={form.control}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading} 
            size="full"
            className="mt-4 py-3 text-lg font-medium shadow-md transition-all hover:shadow-lg focus:ring-2 focus:ring-accent-primary"
          >
            {isLoading ? (isUpdate ? "Updating..." : "Signing up...") : (isUpdate ? "Update Song" : "Sign Up")}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
