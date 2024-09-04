import React from "react"
import { FieldValues } from "react-hook-form"
import { InputType } from "../types"
import { getFieldErrorId, getFieldTestId } from "./testUtils"
import { TextInput } from "./TextInput"
import { VoteInput } from "./VoteInput"
import Link from "next/link"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"

interface Props<T extends FieldValues> {
  field: InputType<T>
  errors: any
  disabled?: boolean
}

export function InputField<T extends FieldValues>({
  field,
  errors,
  disabled,
}: Props<T>) {
  const { size, type, label, field: fieldId, optional } = field
  const hasLink = "link" in field && field.link
  const isSmall = size === "small"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700 mb-4"
      data-testid={getFieldTestId(field.field, type)}
    >
      <Label 
        htmlFor={fieldId} 
        className="text-sm font-medium text-gray-200 mb-2 block"
      >
        {label}
        {optional && <span className="text-gray-400 ml-1">(optional)</span>}
      </Label>
      
      {type === "vote" ? (
        <VoteInput field={fieldId} />
      ) : (
        <TextInput
          field={fieldId}
          optional={optional}
          type={type}
          placeholder={field.placeholder}
          disabled={disabled}
          defaultValue={field.defaultValue}
          className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
        />
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
  )
}