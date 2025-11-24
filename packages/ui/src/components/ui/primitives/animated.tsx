"use client";

import * as React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "./utils";

/**
 * Common animation variants for consistent motion throughout the app
 */
export const animationVariants = {
  // Fade in animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Fade in with upward movement
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Fade in with downward movement
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
} as const satisfies Record<string, Variants>;

export type AnimationVariant = keyof typeof animationVariants;

export interface AnimatedProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  /**
   * The animation variant to use
   * @default "fadeIn"
   */
  variant?: AnimationVariant;
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number;
  /**
   * Animation duration (in seconds)
   * @default 0.5
   */
  duration?: number;
  /**
   * Custom variants (overrides the variant prop)
   */
  customVariants?: Variants;
}

/**
 * Animated - A wrapper component for common animation patterns
 *
 * Usage:
 * ```tsx
 * <Animated variant="fadeInUp" delay={0.2}>
 *   <div>Content</div>
 * </Animated>
 * ```
 */
export const Animated = React.forwardRef<HTMLDivElement, AnimatedProps>(
  ({
    variant = "fadeIn",
    delay = 0,
    duration = 0.5,
    customVariants,
    className,
    children,
    ...props
  }, ref) => {
    const variants = customVariants || animationVariants[variant];

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Animated.displayName = "Animated";

/**
 * AnimatedList - Automatically staggers animation delays for list items
 *
 * Usage:
 * ```tsx
 * <AnimatedList variant="fadeInUp" staggerDelay={0.1}>
 *   {items.map(item => (
 *     <AnimatedList.Item key={item.id}>
 *       {item.content}
 *     </AnimatedList.Item>
 *   ))}
 * </AnimatedList>
 * ```
 */
export interface AnimatedListProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  variant?: AnimationVariant;
  /**
   * Base delay before first item animates
   * @default 0
   */
  baseDelay?: number;
  /**
   * Delay between each item animation
   * @default 0.1
   */
  staggerDelay?: number;
  /**
   * Animation duration for each item
   * @default 0.5
   */
  duration?: number;
}

const AnimatedListContext = React.createContext<{
  variant: AnimationVariant;
  baseDelay: number;
  staggerDelay: number;
  duration: number;
  index: number;
}>({
  variant: "fadeIn",
  baseDelay: 0,
  staggerDelay: 0.1,
  duration: 0.5,
  index: 0,
});

export const AnimatedList = React.forwardRef<HTMLDivElement, AnimatedListProps>(
  ({
    variant = "fadeInUp",
    baseDelay = 0,
    staggerDelay = 0.1,
    duration = 0.5,
    className,
    children,
    ...props
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {React.Children.map(children as React.ReactElement[], (child, index) => (
          <AnimatedListContext.Provider
            value={{ variant, baseDelay, staggerDelay, duration, index }}
          >
            {child}
          </AnimatedListContext.Provider>
        ))}
      </motion.div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

/**
 * AnimatedList.Item - A list item that automatically receives staggered animation
 */
export interface AnimatedListItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {}

const AnimatedListItem = React.forwardRef<HTMLDivElement, AnimatedListItemProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, baseDelay, staggerDelay, duration, index } = React.useContext(AnimatedListContext);
    const variants = animationVariants[variant];
    const itemDelay = baseDelay + (index * staggerDelay);

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, delay: itemDelay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedListItem.displayName = "AnimatedList.Item";

// Attach Item as a property of AnimatedList
(AnimatedList as any).Item = AnimatedListItem;

// Export with proper typing
export { AnimatedListItem };
