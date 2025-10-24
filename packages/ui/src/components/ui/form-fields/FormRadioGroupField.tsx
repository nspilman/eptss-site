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
  RadioGroup,
  RadioGroupItem,
  RadioGroupLabel,
} from "../primitives"

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
        <FormItem className={className} id={`form-field-${name}`}>
          <FormLabel className="text-lg font-medium tracking-wide bg-clip-text text-transparent bg-linear-to-r from-[#e2e240] to-[#40e2e2]">
            {label}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className={orientation === "vertical" ? "flex flex-col gap-4" : "flex flex-row gap-8"}
              disabled={disabled}
            >
              {options.map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                  />
                  <RadioGroupLabel
                    htmlFor={`${name}-${option.value}`}
                    selected={field.value === option.value}
                  >
                    {option.label}
                  </RadioGroupLabel>
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
