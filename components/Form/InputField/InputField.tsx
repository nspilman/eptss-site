import React from "react";
import { FieldValues } from "react-hook-form";
import { InputType } from "../types";
import { getFieldErrorId, getFieldTestId } from "./testUtils";
import { TextInput } from "./TextInput";
import { VoteInput } from "./VoteInput";
import Link from "next/link";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { MusicIcon } from "lucide-react";

interface Props<T extends FieldValues> {
  field: InputType<T>;
  errors: any;
  disabled?: boolean;
}

export function InputField<T extends FieldValues>({
  field,
  errors,
  disabled,
}: Props<T>) {
  const { size, type, label, field: fieldId, optional } = field;
  const hasLink = "link" in field && field.link;
  const isSmall = size === "small";

  return (
<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0a0a1e] rounded-lg p-6 border border-gray-700 shadow-lg max-w-md w-full mx-auto"
    >
      {type === "vote" ? (
        <>
         <div className="flex items-center space-x-2">
         <MusicIcon className="h-6 w-6 text-[#e2e240]" />
         {optional && <span className="text-gray-400 ml-1">(optional)</span>}
 
         <h3 className="text-xl font-semibold text-gray-100">{label}</h3>
       </div>
       <p className="text-sm text-gray-400">
         How much do you want to cover this song?
       </p>
        <VoteInput field={fieldId} />
        </>
      ) : (
        <>
         <Label
      htmlFor={fieldId || label.toLowerCase().replace(/\s+/g, '-')}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {label}
    </Label>
        <TextInput
          field={fieldId}
          optional={optional}
          type={type}
          placeholder={field.placeholder}
          disabled={disabled}
          defaultValue={field.defaultValue}
        />
        </>
      )}

      <div className="mt-2">
        {errors[fieldId] ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400"
            data-testid={getFieldErrorId(fieldId)}
          >
            This field is required
          </motion.p>
        ) : hasLink ? (
          <Link
            className="text-sm font-medium text-[#e2e240] hover:text-[#f0f050] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            href={field.link}
          >
            Listen Here
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
