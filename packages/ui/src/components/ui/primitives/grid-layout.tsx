import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const gridVariants = cva(
  "grid w-full",
  {
    variants: {
      gap: {
        none: "gap-0",
        xs: "gap-2",
        sm: "gap-3",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        7: "grid-cols-7",
        8: "grid-cols-8",
        9: "grid-cols-9",
        10: "grid-cols-10",
        11: "grid-cols-11",
        12: "grid-cols-12",
      },
    },
    defaultVariants: {
      gap: "md",
      align: "start",
    },
  }
)

export interface GridLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof gridVariants>, 'cols'> {
  /**
   * Number of columns for desktop layout
   * @default 12
   */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /**
   * Custom grid-template-columns value for desktop
   * Use this for fractional layouts like "2fr 1fr"
   * Overrides cols prop
   */
  template?: string

  /**
   * Number of columns for mobile/tablet
   * @default 1
   */
  mobileCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /**
   * Breakpoint at which to switch from mobile to desktop layout
   * @default "md" (768px)
   */
  breakpoint?: "sm" | "md" | "lg" | "xl"
}

/**
 * GridLayout - Flexible CSS Grid layout component
 *
 * @example
 * // 2-column layout with custom fractional widths
 * <GridLayout template="2fr 1fr">
 *   <GridItem>Main content (2/3 width)</GridItem>
 *   <GridItem>Sidebar (1/3 width)</GridItem>
 * </GridLayout>
 *
 * @example
 * // 3-column equal width grid
 * <GridLayout cols={3}>
 *   <GridItem>Column 1</GridItem>
 *   <GridItem>Column 2</GridItem>
 *   <GridItem>Column 3</GridItem>
 * </GridLayout>
 *
 * @example
 * // Item spanning multiple columns
 * <GridLayout cols={3}>
 *   <GridItem colSpan={3}>Full width header</GridItem>
 *   <GridItem>Column 1</GridItem>
 *   <GridItem>Column 2</GridItem>
 *   <GridItem>Column 3</GridItem>
 * </GridLayout>
 */
const GridLayout = React.forwardRef<HTMLDivElement, GridLayoutProps>(
  ({
    className,
    gap,
    align,
    cols = 12,
    template,
    mobileCols = 1,
    breakpoint = "md",
    style,
    ...props
  }, ref) => {
    // Map mobile columns to Tailwind classes
    const mobileColsMap = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
    }

    // Map desktop columns to Tailwind classes with breakpoint prefix
    const desktopColsMap = {
      1: `${breakpoint}:grid-cols-1`,
      2: `${breakpoint}:grid-cols-2`,
      3: `${breakpoint}:grid-cols-3`,
      4: `${breakpoint}:grid-cols-4`,
      5: `${breakpoint}:grid-cols-5`,
      6: `${breakpoint}:grid-cols-6`,
      7: `${breakpoint}:grid-cols-7`,
      8: `${breakpoint}:grid-cols-8`,
      9: `${breakpoint}:grid-cols-9`,
      10: `${breakpoint}:grid-cols-10`,
      11: `${breakpoint}:grid-cols-11`,
      12: `${breakpoint}:grid-cols-12`,
    }

    // If using custom template, generate unique ID and inline styles
    if (template) {
      const gridId = React.useId().replace(/:/g, '')
      const breakpointPx = {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      }

      return (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
              .grid-layout-${gridId} {
                grid-template-columns: repeat(${mobileCols}, 1fr);
              }
              @media (min-width: ${breakpointPx[breakpoint]}) {
                .grid-layout-${gridId} {
                  grid-template-columns: ${template};
                }
              }
            `
          }} />
          <div
            ref={ref}
            className={cn(
              gridVariants({ gap, align }),
              `grid-layout-${gridId}`,
              className
            )}
            style={style}
            {...props}
          />
        </>
      )
    }

    // Use Tailwind classes for standard column counts
    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ gap, align }),
          mobileColsMap[mobileCols],
          desktopColsMap[cols],
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)
GridLayout.displayName = "GridLayout"

const gridItemVariants = cva(
  "min-w-0 h-full", // Prevents grid blowout + full height
  {
    variants: {
      align: {
        start: "self-start",
        center: "self-center",
        end: "self-end",
        stretch: "self-stretch",
      },
    },
  }
)

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  /**
   * Number of columns to span (desktop)
   * @default 1
   */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full"

  /**
   * Number of columns to span on mobile
   * @default 1
   */
  mobileColSpan?: 1 | 2 | 3 | 4 | "full"

  /**
   * Number of rows to span
   * @default 1
   */
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * Grid column start position
   */
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

  /**
   * Breakpoint at which to apply desktop column span
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl"
}

/**
 * GridItem - Grid cell wrapper with span controls
 *
 * @example
 * <GridItem colSpan={2}>Spans 2 columns</GridItem>
 *
 * @example
 * <GridItem colSpan="full">Full width</GridItem>
 *
 * @example
 * <GridItem colSpan={3} rowSpan={2}>Spans 3 columns and 2 rows</GridItem>
 */
const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    align,
    colSpan = 1,
    mobileColSpan = 1,
    rowSpan = 1,
    colStart,
    breakpoint = "md",
    style,
    ...props
  }, ref) => {
    // Mobile column span map
    const mobileColSpanMap: Record<number | "full", string> = {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      full: "col-span-full",
    }

    // Desktop column span maps for each breakpoint
    const desktopColSpanMaps = {
      sm: {
        1: "sm:col-span-1",
        2: "sm:col-span-2",
        3: "sm:col-span-3",
        4: "sm:col-span-4",
        5: "sm:col-span-5",
        6: "sm:col-span-6",
        7: "sm:col-span-7",
        8: "sm:col-span-8",
        9: "sm:col-span-9",
        10: "sm:col-span-10",
        11: "sm:col-span-11",
        12: "sm:col-span-12",
        full: "sm:col-span-full",
      },
      md: {
        1: "md:col-span-1",
        2: "md:col-span-2",
        3: "md:col-span-3",
        4: "md:col-span-4",
        5: "md:col-span-5",
        6: "md:col-span-6",
        7: "md:col-span-7",
        8: "md:col-span-8",
        9: "md:col-span-9",
        10: "md:col-span-10",
        11: "md:col-span-11",
        12: "md:col-span-12",
        full: "md:col-span-full",
      },
      lg: {
        1: "lg:col-span-1",
        2: "lg:col-span-2",
        3: "lg:col-span-3",
        4: "lg:col-span-4",
        5: "lg:col-span-5",
        6: "lg:col-span-6",
        7: "lg:col-span-7",
        8: "lg:col-span-8",
        9: "lg:col-span-9",
        10: "lg:col-span-10",
        11: "lg:col-span-11",
        12: "lg:col-span-12",
        full: "lg:col-span-full",
      },
      xl: {
        1: "xl:col-span-1",
        2: "xl:col-span-2",
        3: "xl:col-span-3",
        4: "xl:col-span-4",
        5: "xl:col-span-5",
        6: "xl:col-span-6",
        7: "xl:col-span-7",
        8: "xl:col-span-8",
        9: "xl:col-span-9",
        10: "xl:col-span-10",
        11: "xl:col-span-11",
        12: "xl:col-span-12",
        full: "xl:col-span-full",
      },
    }

    // Row span map
    const rowSpanMap = {
      1: "",
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
      5: "row-span-5",
      6: "row-span-6",
    }

    // Column start maps for each breakpoint
    const colStartMaps = {
      sm: {
        1: "sm:col-start-1",
        2: "sm:col-start-2",
        3: "sm:col-start-3",
        4: "sm:col-start-4",
        5: "sm:col-start-5",
        6: "sm:col-start-6",
        7: "sm:col-start-7",
        8: "sm:col-start-8",
        9: "sm:col-start-9",
        10: "sm:col-start-10",
        11: "sm:col-start-11",
        12: "sm:col-start-12",
      },
      md: {
        1: "md:col-start-1",
        2: "md:col-start-2",
        3: "md:col-start-3",
        4: "md:col-start-4",
        5: "md:col-start-5",
        6: "md:col-start-6",
        7: "md:col-start-7",
        8: "md:col-start-8",
        9: "md:col-start-9",
        10: "md:col-start-10",
        11: "md:col-start-11",
        12: "md:col-start-12",
      },
      lg: {
        1: "lg:col-start-1",
        2: "lg:col-start-2",
        3: "lg:col-start-3",
        4: "lg:col-start-4",
        5: "lg:col-start-5",
        6: "lg:col-start-6",
        7: "lg:col-start-7",
        8: "lg:col-start-8",
        9: "lg:col-start-9",
        10: "lg:col-start-10",
        11: "lg:col-start-11",
        12: "lg:col-start-12",
      },
      xl: {
        1: "xl:col-start-1",
        2: "xl:col-start-2",
        3: "xl:col-start-3",
        4: "xl:col-start-4",
        5: "xl:col-start-5",
        6: "xl:col-start-6",
        7: "xl:col-start-7",
        8: "xl:col-start-8",
        9: "xl:col-start-9",
        10: "xl:col-start-10",
        11: "xl:col-start-11",
        12: "xl:col-start-12",
      },
    }

    const mobileSpanClass = mobileColSpanMap[mobileColSpan]
    const desktopSpanClass = desktopColSpanMaps[breakpoint][colSpan]
    const rowSpanClass = rowSpanMap[rowSpan]
    const colStartClass = colStart ? colStartMaps[breakpoint][colStart] : ""

    return (
      <div
        ref={ref}
        className={cn(
          gridItemVariants({ align }),
          mobileSpanClass,
          desktopSpanClass,
          rowSpanClass,
          colStartClass,
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)
GridItem.displayName = "GridItem"

export { GridLayout, GridItem }
