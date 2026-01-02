import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, primitiveComponent } from './utils'
import { PrimitivePropsWithoutRef } from './types'

const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-gray-700)]',
        success: 'bg-green-900/20',
        warning: 'bg-yellow-900/20',
        error: 'bg-red-900/20',
      },
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-accent-primary)]',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
)

export interface ProgressProps
  extends Omit<PrimitivePropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'>,
    VariantProps<typeof progressVariants> {
  /** Progress value (0-100) */
  value?: number
  /** Show percentage label */
  showLabel?: boolean
  /** Label position */
  labelPosition?: 'top' | 'right' | 'bottom'
  /** Custom label text (overrides percentage) */
  label?: string
  /** Animate the indicator (pulse effect) */
  animated?: boolean
  /** Indicator variant (can differ from background) */
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>['variant']
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      variant,
      size,
      value = 0,
      showLabel = false,
      labelPosition = 'top',
      label,
      animated = false,
      indicatorVariant,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(value, 0), 100)
    const displayLabel = label || `${Math.round(clampedValue)}%`
    const indicatorColor = indicatorVariant || variant

    const progressBar = (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ variant, size }), className)}
        value={clampedValue}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant: indicatorColor, animated }))}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </ProgressPrimitive.Root>
    )

    if (!showLabel) {
      return progressBar
    }

    if (labelPosition === 'right') {
      return (
        <div className="flex items-center gap-3">
          {progressBar}
          <span className="text-sm font-medium text-[var(--color-primary)] min-w-[3ch] text-right">
            {displayLabel}
          </span>
        </div>
      )
    }

    if (labelPosition === 'bottom') {
      return (
        <div className="flex flex-col gap-1">
          {progressBar}
          <span className="text-xs font-medium text-[var(--color-gray-400)]">
            {displayLabel}
          </span>
        </div>
      )
    }

    // Default: top
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[var(--color-gray-400)]">
          {displayLabel}
        </span>
        {progressBar}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

const ProgressComponent = primitiveComponent(Progress, 'Progress')

export { ProgressComponent as Progress, progressVariants, progressIndicatorVariants }
export default ProgressComponent
