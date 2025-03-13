# UI Primitives Architecture

This directory contains the foundational UI primitives built on top of Radix UI. These components are designed to be composable, accessible, and type-safe while maintaining a consistent design system.

## Core Principles

1. **Composability**: All components support the `asChild` prop for flexible composition
2. **Type Safety**: Full TypeScript support with proper type inference
3. **Accessibility**: Built on Radix UI primitives for ARIA compliance
4. **Styling**: Uses Tailwind CSS with class-variance-authority for variants

## Component Structure

Each primitive component follows this pattern:
- Strongly typed props extending Radix types
- Consistent styling using the `cn` utility
- Support for refs and proper display names
- Variants defined using class-variance-authority where applicable

## Usage Example

```tsx
import { Button, Input, Form, FormField, FormItem, FormLabel } from './primitives'

// Basic usage
<Button variant="default" size="lg">Click Me</Button>

// Form usage
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <Input {...field} type="email" />
      </FormItem>
    )}
  />
</Form>
```

## Available Components

- `Button`: Base button component with variants
- `Input`: Text input component
- `Form`: Form components built on react-hook-form
  - FormField
  - FormItem
  - FormLabel
  - FormControl
  - FormDescription
  - FormMessage

## Utilities

- `cn`: Combines Tailwind classes with proper precedence
- `primitiveComponent`: Adds proper display names to components
- Type utilities for proper TypeScript support

## Adding New Components

When adding new components:
1. Create the component file in this directory
2. Export it through `index.ts`
3. Follow the existing patterns for type safety and composability
4. Add proper JSDoc documentation
5. Include variants where appropriate using class-variance-authority

## Best Practices

1. Always use the `primitiveComponent` utility when creating new components
2. Maintain consistent prop naming across components
3. Support both controlled and uncontrolled variants where applicable
4. Include proper aria attributes for accessibility
5. Use the `cn` utility for class name composition
