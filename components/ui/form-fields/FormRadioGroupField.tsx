"use client";

import * as React from "react"
import { Control } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormRadioGroupFieldProps {
  control: Control<any>
  name: string
  label: string
  description?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  options: {
    label: string
    value: string
  }[]
  orientation?: "horizontal" | "vertical"
}

export function FormRadioGroupField({
  control,
  name,
  label,
  description,
  className,
  disabled,
  options,
  orientation = "horizontal",
}: FormRadioGroupFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-lg font-medium tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
            {label}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className={cn(
                "radio-group",
                orientation === "vertical" ? "flex-col" : "flex-row"
              )}
              disabled={disabled}
            >
              {options.map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                    className={cn(
                      "radio-item peer",
                      field.value === option.value && "selected"
                    )}
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className={cn(
                      "radio-label text-sm tracking-wide transition-all duration-300",
                      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      field.value === option.value && "selected"
                    )}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && (
            <FormDescription className="mt-2 text-xs text-gray-500 tracking-wide">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
