"use client"

// components/SignupsCard.tsx
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

type SignupsCardProps = {
  signupCount: number
}

export const SignupsCard = ({ signupCount }: SignupsCardProps) => (
  <motion.div
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-[#e2e240]">
          <Users className="mr-2" />
          Signups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xl">Total Signups: {signupCount}</p>
      </CardContent>
    </Card>
  </motion.div>
)