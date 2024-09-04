"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input"
import { MusicIcon, ArrowLeft } from "lucide-react"
import { useState } from "react";

export const LoginClient = () => {
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log("Login link requested for:", email)
      // Here you would typically send the login link to the provided email
    }
    return (
    <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-8 border border-gray-700 shadow-lg max-w-md w-full relative z-10"
  >
    <Button
      variant="ghost"
      className="absolute top-4 left-4 text-gray-400 hover:text-gray-100 transition-colors"
      onClick={() => console.log("Back button clicked")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>

    <div className="text-center mb-6">
      <MusicIcon className="mx-auto h-12 w-12 text-[#e2e240] mb-2" />
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
        Get your Login link
      </h1>
      <p className="text-gray-400 mt-2">
        Enter your email below and we will send you a login link.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240]"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#e2e240] to-[#40e2e2] text-gray-900 hover:from-[#f0f050] hover:to-[#50f0f0] transition-all duration-300 transform hover:scale-105"
      >
        Submit
      </Button>
    </form>
  </motion.div>
)}