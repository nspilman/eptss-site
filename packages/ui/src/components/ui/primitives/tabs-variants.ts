import { cva } from "class-variance-authority";

export const tabsListVariants = cva(
  "inline-flex h-10 items-center justify-center rounded-md bg-background-secondary p-1 text-accent-secondary",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium cursor-pointer ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-accent-secondary hover:bg-accent-secondary/10 hover:text-accent-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:hover:bg-background data-[state=active]:hover:text-primary",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-primary",
        outline: "border-b-2 border-transparent data-[state=active]:border-accent-primary data-[state=active]:bg-transparent hover:border-accent-secondary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const tabsContentVariants = cva(
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      padding: {
        default: "p-4",
        none: "",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  }
);
