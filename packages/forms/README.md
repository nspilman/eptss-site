# @eptss/forms

Reusable form components and hooks for the EPTSS application.

## Components

- **FormWrapper** - Animated card wrapper for forms with title and description
- **SubmitButton** - Styled submit button with loading state

## Hooks

- **useFormSubmission** - Form submission hook with validation, error handling, and toast notifications

## Types

- **FormReturn** - Standard return type for form actions
- **Status** - Form submission status type

## Usage

```tsx
import { useFormSubmission, FormWrapper, SubmitButton } from '@eptss/forms';
import { useForm } from 'react-hook-form';

function MyForm() {
  const form = useForm();
  const { isLoading, handleSubmit } = useFormSubmission({
    form,
    onSubmit: mySubmitAction,
    successMessage: 'Form submitted!',
  });

  return (
    <FormWrapper
      title="My Form"
      description="Fill out the form below"
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
      <SubmitButton label="Submit" pending={isLoading} />
    </FormWrapper>
  );
}
```
