"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { FormReturn } from "@/types"

interface FormWrapperProps {
  title: string
  description?: string | ReactNode
  children: ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function FormWrapper({ title, description, children, onSubmit }: FormWrapperProps) {
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
            <div className="text-white font-light text-sm">
              {description}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {children}
        </form>
      </motion.div>
    </div>
  )
}
