"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { Button, Form } from "@eptss/ui"
import { motion } from "framer-motion"
import { FormBuilder, FieldConfig } from "@eptss/ui"
import { signupSchema, nonLoggedInSchema, type SignupFormValues, type NonLoggedInSignupFormValues } from "@eptss/data-access/schemas/signupSchemas"
import { useState } from "react"
import { EmailConfirmationScreen } from "./EmailConfirmationScreen"
import { useRouter } from "next/navigation"
import { UserSignupData } from "@eptss/data-access/types/signup"
import { useCaptcha } from "@eptss/captcha"


interface SignupFormProps {
  roundId: number;
  signupsCloseDateLabel: string;
  onSuccess?: () => void;
  isLoggedIn?: boolean;
  isUpdate?: boolean;
  existingSignup?: UserSignupData;
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: (formData: FormData, captchaToken?: string) => Promise<FormReturn>;
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
const nonLoggedInFields: FieldConfig[] = [
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
];

export function SignupForm({
  roundId,
  signupsCloseDateLabel,
  onSuccess,
  isLoggedIn = false,
  isUpdate = false,
  existingSignup,
  signup,
  signupWithOTP
}: SignupFormProps) {
  // State to track if the form has been submitted (for non-logged in users)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const router = useRouter();

  // Get CAPTCHA hook (only used for non-logged-in users)
  const { executeRecaptcha, isReady: isCaptchaReady } = useCaptcha();

  // Determine which schema and fields to use based on login status
  const schema = isLoggedIn ? signupSchema : nonLoggedInSchema;
  const formFields = isLoggedIn ? baseFormFields : [...nonLoggedInFields, ...baseFormFields];
  
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
            status: 400,
            message: "Security verification failed. Please refresh the page and try again.",
            redirect: undefined,
          };
        }
      } catch (error) {
        console.error('[SignupForm] CAPTCHA execution error:', error);
        return {
          status: 400,
          message: "Security verification error. Please try again.",
          redirect: undefined,
        };
      }

      // Save the email for the confirmation screen
      const email = formData.get("email") as string;
      if (email) {
        setSubmittedEmail(email);
      }

      return await signupWithOTP(formData, captchaToken);
    }
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    onSuccess: () => {
      if (!isLoggedIn) {
        setIsSubmitted(true);
      } else if (isUpdate) {
        // For updates, redirect to the success page
        router.push(`/sign-up?success=true`);
      } else if (onSuccess) {
        onSuccess();
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
              <div className="mb-6 border-l-4 border-accent-primary pl-4">
                <h3 className="text-xl font-medium font-fraunces text-primary">Your Information</h3>
                <p className="mt-1 text-sm text-accent-primary opacity-90">We&lsquo;ll send you a verification link to complete your signup</p>
              </div>
              <div className="space-y-5">
                <FormBuilder
                  fields={nonLoggedInFields}
                  control={form.control}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          
          <div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm">
            <div className="mb-6 border-l-4 border-accent-secondary pl-4">
              <h3 className="text-xl font-medium font-fraunces text-primary">Round Signup</h3>
              <p className="mt-1 text-sm text-accent-primary opacity-90">Enter the song you&lsquo;d like to cover for this round</p>
            </div>
            <div className="space-y-5">
              <FormBuilder
                fields={baseFormFields}
                control={form.control}
                disabled={isLoading}
              />
            </div>
          </div>
          
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
