"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

interface FormWrapperProps {
  title: string
  description?: string
  children: ReactNode
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function FormWrapper({ title, description, children, onSubmit }: FormWrapperProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = await onSubmit(new FormData(e.currentTarget))
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
      })
    }
  }

  return (
    <div className="space-y-6 relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-[#40e2e2] to-[#e2e240] rounded-lg blur opacity-15 pointer-events-none group-hover:opacity-25 group-hover:blur-lg transition duration-700"></div>
      <motion.div
        className="relative space-y-6 bg-black rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col text-center font-fraunces">
          <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2] pb-1">
            {title}
          </h1>
          {description && (
            <span className="text-white font-light text-sm">{description}</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {children}
        </form>
      </motion.div>
    </div>
  )
}
