"use client";

import { Control } from "react-hook-form";
import { FormInputField } from "./FormInputField";
import { FormTextareaField } from "./FormTextareaField";
import { FormRadioGroupField } from "./FormRadioGroupField";
import { cn } from "@/components/ui/primitives";

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
