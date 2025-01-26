/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { FormBuilder } from '@/components/ui/form-fields/FormBuilder'
import { Button } from '@/components/ui/button'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { Toaster } from '@/components/ui/toaster'
import { FormReturn } from '@/types'

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  favoriteColor: z.string().min(1, 'Please select a favorite color'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
})

type TestFormData = z.infer<typeof testSchema>

// Test form component
function CompleteTestForm({
  onSubmit,
  onSuccess,
  successMessage = 'Success!',
}: {
  onSubmit: (data: FormData) => Promise<FormReturn>
  onSuccess?: () => void
  successMessage?: string
}) {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      email: '',
      favoriteColor: '',
      bio: '',
    },
  })

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    successMessage,
    onSuccess,
  })

  return (
    <Form {...form}>
      <form
        data-testid="test-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <FormBuilder
          form={form}
          fields={[
            {
              name: 'name',
              type: 'input',
              label: 'Name',
              description: 'Your full name',
              placeholder: 'Enter your name',
              disabled: isLoading,
            },
            {
              name: 'email',
              type: 'input',
              label: 'Email',
              description: 'Your email address',
              placeholder: 'Enter your email',
              disabled: isLoading,
            },
            {
              name: 'favoriteColor',
              type: 'radio',
              label: 'Favorite Color',
              options: [
                { label: 'Red', value: 'red' },
                { label: 'Blue', value: 'blue' },
                { label: 'Green', value: 'green' },
              ],
              disabled: isLoading,
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Bio',
              description: 'Tell us about yourself',
              placeholder: 'Tell us about yourself',
              disabled: isLoading,
            },
          ]}
          control={form.control}
          disabled={isLoading}
        />
        <Button
          type="submit"
          data-testid="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}

// Test utils
const renderForm = (props: React.ComponentProps<typeof CompleteTestForm>) => {
  return render(
    <div data-testid="form-container">
      <CompleteTestForm {...props} />
      <Toaster />
    </div>
  )
}

const fillForm = (data: Partial<TestFormData> = {}) => {
  const defaultData = {
    name: 'John Doe',
    email: 'john@example.com',
    favoriteColor: 'blue',
    bio: 'This is my test biography that is definitely long enough.',
    ...data,
  }

  fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
    target: { value: defaultData.name },
  })
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: defaultData.email },
  })
  const colorLabel = defaultData.favoriteColor.charAt(0).toUpperCase() + defaultData.favoriteColor.slice(1)
  const radioButton = screen.getByLabelText(colorLabel)
  fireEvent.click(radioButton)
  fireEvent.change(screen.getByPlaceholderText('Tell us about yourself'), {
    target: { value: defaultData.bio },
  })
}

const submitForm = () => {
  fireEvent.click(screen.getByTestId('submit-button'))
}

describe('Form Submission', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  it('Form submission sends form data and calls onSuccess when all fields are valid', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        status: 'Success',
        message: '',
      }
    })
    const onSuccess = jest.fn()
    const successMessage = 'Form submitted successfully!'

    renderForm({
      onSubmit,
      onSuccess,
      successMessage,
    })

    fillForm()
    submitForm()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    const formData = onSubmit.mock.calls[0][0] as FormData
    expect(formData.get('name')).toBe('John Doe')
    expect(formData.get('email')).toBe('john@example.com')
    expect(formData.get('favoriteColor')).toBe('blue')
    expect(formData.get('bio')).toBe('This is my test biography that is definitely long enough.')

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(screen.getByText(successMessage)).toBeInTheDocument()
    })
  })

  it('Form submission displays field-specific error messages when submitted with empty fields', async () => {
    const onSubmit = jest.fn()
    renderForm({ onSubmit })

    submitForm()

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Please select a favorite color')).toBeInTheDocument()
      expect(screen.getByText('Bio must be at least 10 characters')).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('Form submission displays server error message when server returns an error response', async () => {
    const errorMessage = 'Server validation failed'
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        status: 'Error',
        message: errorMessage,
      }
    })
    const onSuccess = jest.fn()

    renderForm({ onSubmit, onSuccess })

    fillForm()
    submitForm()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  it('Form submission disables all inputs and shows loading state when submission is in progress', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        status: 'Success',
        message: '',
      }
    })

    renderForm({ onSubmit })

    fillForm()
    submitForm()

    // Check loading state
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submitting...')
      expect(screen.getByPlaceholderText('Enter your name')).toBeDisabled()
      expect(screen.getByPlaceholderText('Enter your email')).toBeDisabled()
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeDisabled()
    })

    // Wait for form submission to complete
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit')
    })
  })

  it('Form submission displays generic error message when network request fails', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      throw new Error('Network error')
    })
    const onSuccess = jest.fn()

    renderForm({ onSubmit, onSuccess })

    fillForm()
    submitForm()

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  it('Form submission accepts maximum length inputs when values are at character limits', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Success',
      message: '',
    }))

    renderForm({ onSubmit })

    // Fill form with maximum length values
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'a'.repeat(100) },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'a'.repeat(50) + '@example.com' },
    })
    fireEvent.click(screen.getByLabelText('Blue'))
    fireEvent.change(screen.getByPlaceholderText('Tell us about yourself'), {
      target: { value: 'a'.repeat(1000) },
    })

    submitForm()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('Form submission clears all input values when submission succeeds', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Success',
      message: '',
    }))

    renderForm({ onSubmit })

    fillForm()
    submitForm()

    await waitFor(() => {
      // Check if form fields are reset
      expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('')
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('')
      expect(screen.getByPlaceholderText('Tell us about yourself')).toHaveValue('')
      
      // Check radio buttons are unchecked
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked()
      })
    })
  })

  it('Form submission prevents duplicate submissions when clicked multiple times', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        status: 'Success',
        message: '',
      }
    })

    renderForm({ onSubmit })

    fillForm()
    
    // Submit form
    submitForm()
    
    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
    
    // Try additional submissions while loading
    submitForm()
    submitForm()

    // Should only be called once due to disabled state
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('Form submission preserves special characters when sending form data', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Success',
      message: '',
    }))

    renderForm({ onSubmit })

    // Fill form with special characters
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Jöhn O\'Connor-Smith' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test+special@example.com' },
    })
    fireEvent.click(screen.getByLabelText('Blue'))
    fireEvent.change(screen.getByPlaceholderText('Tell us about yourself'), {
      target: { value: '🚀 This is a test with émojis and accènts!' },
    })

    submitForm()

    await waitFor(() => {
      const formData = onSubmit.mock.calls[0][0] as FormData
      expect(formData.get('name')).toBe('Jöhn O\'Connor-Smith')
      expect(formData.get('email')).toBe('test+special@example.com')
      expect(formData.get('bio')).toBe('🚀 This is a test with émojis and accènts!')
    })
  })

  it('Form submission maintains field values when server returns an error', async () => {
    const errorMessage = 'Server validation failed'
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Error',
      message: errorMessage,
    }))

    renderForm({ onSubmit })

    // Fill form with test data
    const testData = {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Test biography',
    }

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: testData.name },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: testData.email },
    })
    fireEvent.click(screen.getByLabelText('Blue'))
    fireEvent.change(screen.getByPlaceholderText('Tell us about yourself'), {
      target: { value: testData.bio },
    })

    submitForm()

    await waitFor(() => {
      // Check error message is shown
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      // Verify form values are preserved
      expect(screen.getByPlaceholderText('Enter your name')).toHaveValue(testData.name)
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue(testData.email)
      expect(screen.getByPlaceholderText('Tell us about yourself')).toHaveValue(testData.bio)
    })
  })

  it('Form submission re-enables inputs after server timeout', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
    })

    renderForm({ onSubmit })
    fillForm()
    submitForm()

    // Check loading state
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled()
      expect(screen.getByPlaceholderText('Enter your name')).toBeDisabled()
    })

    // Check recovery from error
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).not.toBeDisabled()
      expect(screen.getByPlaceholderText('Enter your name')).not.toBeDisabled()
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('Form submission calls onSuccess with empty fields after successful submission', async () => {
    const onSuccess = jest.fn()
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Success',
      message: '',
    }))

    renderForm({ onSubmit, onSuccess })
    fillForm()
    submitForm()

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      // Verify form is cleared
      expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('')
      expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('')
      expect(screen.getByPlaceholderText('Tell us about yourself')).toHaveValue('')
      // Verify radio buttons are reset
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked()
      })
    })
  })

  it('Form submission displays custom success message when provided', async () => {
    const customMessage = 'Your form was successfully submitted!'
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Success',
      message: '',
    }))

    renderForm({ onSubmit, successMessage: customMessage })
    fillForm()
    submitForm()

    await waitFor(() => {
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })
  })

  it('Radio buttons allow only one selection at a time', async () => {
    const onSubmit = jest.fn()
    renderForm({ onSubmit })

    // Click each radio button in sequence and verify only the last one is selected
    fireEvent.click(screen.getByLabelText('Red'))
    expect(screen.getByLabelText('Red')).toBeChecked()
    expect(screen.getByLabelText('Blue')).not.toBeChecked()
    expect(screen.getByLabelText('Green')).not.toBeChecked()

    fireEvent.click(screen.getByLabelText('Blue'))
    expect(screen.getByLabelText('Red')).not.toBeChecked()
    expect(screen.getByLabelText('Blue')).toBeChecked()
    expect(screen.getByLabelText('Green')).not.toBeChecked()

    fireEvent.click(screen.getByLabelText('Green'))
    expect(screen.getByLabelText('Red')).not.toBeChecked()
    expect(screen.getByLabelText('Blue')).not.toBeChecked()
    expect(screen.getByLabelText('Green')).toBeChecked()
  })

  it('Radio buttons maintain selection during form validation errors', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => ({
      status: 'Error',
      message: 'Validation failed',
    }))
    renderForm({ onSubmit })

    // Fill only the radio button
    fireEvent.click(screen.getByLabelText('Blue'))
    submitForm()

    await waitFor(() => {
      // Verify radio selection is maintained after validation error
      expect(screen.getByLabelText('Blue')).toBeChecked()
      // Verify other validation errors are shown
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Bio must be at least 10 characters')).toBeInTheDocument()
    })
  })

  it('Radio buttons are disabled during form submission', async () => {
    const onSubmit = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return { status: 'Success', message: '' }
    })
    renderForm({ onSubmit })

    fillForm()
    submitForm()

    await waitFor(() => {
      // Verify all radio buttons are disabled during submission
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled()
      })
    })
  })

  it('Radio buttons display validation error when no option is selected', async () => {
    const onSubmit = jest.fn()
    renderForm({ onSubmit })

    // Fill all fields except radio button
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Tell us about yourself'), {
      target: { value: 'This is a test biography that is definitely long enough.' },
    })

    submitForm()

    await waitFor(() => {
      expect(screen.getByText('Please select a favorite color')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
