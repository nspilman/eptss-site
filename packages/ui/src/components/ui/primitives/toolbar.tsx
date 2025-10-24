"use client"

import * as React from "react"
import * as ToolbarPrimitive from "@radix-ui/react-toolbar"
import { cn, primitiveComponent } from "./utils"
import { PrimitivePropsWithoutRef } from "./types"

const Toolbar = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Root
    ref={ref}
    className={cn(
      "flex flex-col md:flex-row justify-center items-center gap-2",
      className
    )}
    {...props}
  />
))

Toolbar.displayName = "Toolbar"

const ToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Button>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      className
    )}
    {...props}
  />
))

ToolbarButton.displayName = "ToolbarButton"

export interface ButtonGroupProps extends PrimitivePropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "flex-row",
        "gap-2",
        className
      )}
      {...props}
    />
  )
)

ButtonGroup.displayName = "ButtonGroup"

export default primitiveComponent(Toolbar, "Toolbar")
export const ToolbarButtonGroup = primitiveComponent(ButtonGroup, "ToolbarButtonGroup")
export const ToolbarToggle = primitiveComponent(ToolbarButton, "ToolbarToggle")
