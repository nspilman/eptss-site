import * as React from "react"
import { Button } from "@/components/ui/button"
import { Disc, Mic2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

interface Round {
  number: number
  song: string
  artist: string
}

const rounds: Round[] = [
  { number: 22, song: "Who Loves The Sun", artist: "The Velvet Underground" },
  { number: 21, song: "California Dreamin", artist: "The mamas and the papas" },
  { number: 20, song: "Imagine", artist: "John Lennon" },
  { number: 19, song: "Smells Like Teen Spirit", artist: "Nirvana" },
  { number: 18, song: "Billie Jean", artist: "Michael Jackson" },
]

export default function PreviousRounds() {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto w-full"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-100 flex items-center">
        <Disc className="mr-2 h-7 w-7 text-[#e2e240] animate-spin-slow" />
        Previous Rounds
      </h2>
      <div className="space-y-4">
        {rounds.map((round, index) => (
          <motion.div 
            key={round.number}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700 flex justify-between items-center hover:bg-opacity-70 transition-all group"
          >
            <span className="text-xl font-semibold text-gray-100 flex items-center">
              <Mic2 className="mr-2 h-5 w-5 text-[#e2e240]" />
              {round.number}. {round.song} by {round.artist}
            </span>
            <Button variant="ghost" className="text-[#e2e240] hover:text-gray-100 hover:bg-[#e2e24040] flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              Listen
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="link" className="text-[#e2e240] hover:text-[#f0f050]">
          View all past rounds
        </Button>
      </div>
    </motion.div>
  )
}