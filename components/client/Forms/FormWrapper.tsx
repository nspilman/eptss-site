"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { FormReturn } from "@/types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/primitives"

interface FormWrapperProps {
  title: string
  description?: string | ReactNode
  children: ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function FormWrapper({ title, description, children, onSubmit }: FormWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card gradient>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            {children}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
