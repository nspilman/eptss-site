import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

/**
 * Polymorphic component type utilities
 * Allows components to render as different HTML elements with full type safety
 */
type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = {
  as?: C
  asChild?: boolean
} & Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props | 'as' | 'asChild'>

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref']

/**
 * Display - Large hero text, typically used for page titles and major headings
 */
const displayVariants = cva(
  'font-fraunces text-[var(--color-primary)] font-black tracking-tight',
  {
    variants: {
      size: {
        sm: 'text-3xl md:text-4xl',
        md: 'text-4xl md:text-5xl',
        lg: 'text-5xl md:text-6xl',
      },
      gradient: {
        true: 'bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      gradient: false,
    },
  }
)

export type DisplayProps<C extends React.ElementType = 'h1'> =
  PolymorphicComponentProps<C, VariantProps<typeof displayVariants>>

type DisplayComponent = <C extends React.ElementType = 'h1'>(
  props: DisplayProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null

export const Display = React.forwardRef(
  ({ className, size, gradient, asChild = false, as, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : (as || 'h1')
    return (
      <Comp
        className={cn(displayVariants({ size, gradient }), className)}
        ref={ref}
        {...props}
      />
    )
  }
) as DisplayComponent

/**
 * Heading - Standard section and subsection headings
 */
const headingVariants = cva(
  'font-fraunces text-[var(--color-primary)] font-bold tracking-tight',
  {
    variants: {
      size: {
        xs: 'text-lg',
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export type HeadingProps<C extends React.ElementType = 'h2'> =
  PolymorphicComponentProps<C, VariantProps<typeof headingVariants>>

type HeadingComponent = <C extends React.ElementType = 'h2'>(
  props: HeadingProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null

export const Heading = React.forwardRef(
  ({ className, size, asChild = false, as, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : (as || 'h2')
    return (
      <Comp
        className={cn(headingVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
) as HeadingComponent

/**
 * Text - Body text and paragraphs
 */
const textVariants = cva(
  'font-roboto',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      color: {
        primary: 'text-[var(--color-primary)]',
        secondary: 'text-[var(--color-gray-400)]',
        tertiary: 'text-[var(--color-gray-300)]',
        muted: 'text-[var(--color-muted-foreground)]',
        accent: 'text-[var(--color-accent-primary)]',
        'accent-secondary': 'text-[var(--color-accent-secondary)]',
        destructive: 'text-[var(--color-destructive)]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'base',
      color: 'tertiary',
      weight: 'normal',
    },
  }
)

export type TextProps<C extends React.ElementType = 'p'> =
  PolymorphicComponentProps<C, VariantProps<typeof textVariants>>

type TextComponent = <C extends React.ElementType = 'p'>(
  props: TextProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null

export const Text = React.forwardRef(
  ({ className, size, color, weight, asChild = false, as, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : (as || 'p')
    return (
      <Comp
        className={cn(textVariants({ size, color, weight }), className)}
        ref={ref}
        {...props}
      />
    )
  }
) as TextComponent

/**
 * Label - Small labels, metadata, and secondary information
 */
const labelVariants = cva(
  'font-roboto font-medium',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
      },
      color: {
        primary: 'text-[var(--color-primary)]',
        secondary: 'text-[var(--color-gray-400)]',
        accent: 'text-[var(--color-accent-primary)]',
        'accent-secondary': 'text-[var(--color-accent-secondary)]',
        destructive: 'text-[var(--color-destructive)]',
      },
    },
    defaultVariants: {
      size: 'xs',
      color: 'secondary',
    },
  }
)

export type LabelProps<C extends React.ElementType = 'span'> =
  PolymorphicComponentProps<C, VariantProps<typeof labelVariants>>

type LabelComponent = <C extends React.ElementType = 'span'>(
  props: LabelProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null

export const Label = React.forwardRef(
  ({ className, size, color, asChild = false, as, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : (as || 'span')
    return (
      <Comp
        className={cn(labelVariants({ size, color }), className)}
        ref={ref}
        {...props}
      />
    )
  }
) as LabelComponent

/**
 * Quote - Italicized quote text
 */
const quoteVariants = cva(
  'font-roboto italic text-[var(--color-gray-300)]',
  {
    variants: {
      size: {
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
)

export type QuoteProps<C extends React.ElementType = 'p'> =
  PolymorphicComponentProps<C, VariantProps<typeof quoteVariants>>

type QuoteComponent = <C extends React.ElementType = 'p'>(
  props: QuoteProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null

export const Quote = React.forwardRef(
  ({ className, size, asChild = false, as, ...props }: any, ref: any) => {
    const Comp = asChild ? Slot : (as || 'p')
    return (
      <Comp
        className={cn(quoteVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
) as QuoteComponent

// Export variants for use in other components
export { displayVariants, headingVariants, textVariants, labelVariants, quoteVariants }
