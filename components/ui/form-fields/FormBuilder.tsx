"use client";

import { Control } from "react-hook-form";
import { FormInputField } from "./FormInputField";
import { FormTextareaField } from "./FormTextareaField";
import { FormRadioGroupField } from "./FormRadioGroupField";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
}

type InputFieldConfig = BaseFieldProps & {
  type: "input";
  inputType?: string;
  autoComplete?: string;
}

type TextareaFieldConfig = BaseFieldProps & {
  type: "textarea";
}

type RadioGroupFieldConfig = BaseFieldProps & {
  type: "radio";
  options: { label: string; value: string }[];
  orientation?: "horizontal" | "vertical";
}

export type FieldConfig = InputFieldConfig | TextareaFieldConfig | RadioGroupFieldConfig;

interface FormBuilderProps {
  fields: FieldConfig[];
  control: Control<any>;
  disabled?: boolean;
}

export function FormBuilder({ fields, control, disabled }: FormBuilderProps) {
  return (
    <>
      {fields.map((field) => {
        const commonProps = {
          key: field.name,
          control,
          name: field.name,
          label: field.label,
          disabled: disabled || field.disabled,
          placeholder: field.placeholder,
          description: field.description,
          className: field.className,
        };

        switch (field.type) {
          case "input":
            return (
              <FormInputField
                {...commonProps}
                type={field.inputType}
                autoComplete={field.autoComplete}
              />
            );
          case "textarea":
            return <FormTextareaField {...commonProps} />;
          case "radio":
            return (
              <FormRadioGroupField
                {...commonProps}
                options={field.options}
                orientation={field.orientation || "horizontal"}
                className={cn(
                  "p-6 rounded-xl bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-sm border border-gray-800/50",
                  "hover:border-gray-700/50 transition-all duration-300",
                  "[&_.radio-group]:flex [&_.radio-group]:gap-12 [&_.radio-group]:mt-4 [&_.radio-group]:justify-between",
                  "[&_.radio-item]:relative [&_.radio-item]:h-5 [&_.radio-item]:w-5",
                  "[&_.radio-item]:rounded-full [&_.radio-item]:border",
                  "[&_.radio-item]:border-gray-600 [&_.radio-item]:bg-black/30",
                  "[&_.radio-item]:transition-all [&_.radio-item]:duration-300",
                  "[&_.radio-item]:after:content-[''] [&_.radio-item]:after:absolute",
                  "[&_.radio-item]:after:inset-[3px] [&_.radio-item]:after:rounded-full",
                  "[&_.radio-item]:after:transform [&_.radio-item]:after:transition-all [&_.radio-item]:after:duration-300",
                  "[&_.radio-item:hover]:border-[#e2e240]/70",
                  "[&_.radio-item.selected]:border-[#40e2e2]",
                  "[&_.radio-item.selected]:after:bg-gradient-to-r [&_.radio-item.selected]:after:from-[#e2e240] [&_.radio-item.selected]:after:to-[#40e2e2]",
                  "[&_.radio-item.selected]:after:shadow-[0_0_12px_rgba(64,226,226,0.5)]",
                  "[&_.radio-label]:font-medium [&_.radio-label]:tracking-wide",
                  "[&_.radio-label.selected]:text-[#40e2e2] [&_.radio-label.selected]:font-semibold",
                  field.className
                )}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
