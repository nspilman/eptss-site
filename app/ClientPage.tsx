"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Disc, Headphones, Mic2, ChevronRight, MusicIcon } from "lucide-react";
import React from "react";
import PreviousRounds from "./MoreRounds";

// export const ClientPage = () => {
//   const [email, setEmail] = React.useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Email submitted:", email);
//     setEmail("");
//   };
//   return (
 

export function ClientPage() {
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-10"></div>
      
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-12 md:mb-20 relative z-10"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center">
          <MusicIcon className="mr-2 h-8 w-8 text-[#e2e240]" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
            everyone plays the same song
          </span>
        </h1>
        <div className="space-x-2 md:space-x-4">
          <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
            FAQ
          </Button>
          <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
            Sign up / Log In!
          </Button>
        </div>
      </motion.nav>

      <main className="flex flex-col space-y-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="max-w-2xl mb-8 md:mb-0">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
                creative fulfillment
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#40e2e2] to-[#e2e240]">
                with fewer decisions
              </span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300"
            >
              Sign up with a song you want to cover. Everyone votes, and the most popular
              is the song that everyone plays. You've got a creative assignment, a deadline
              and a community of musicians doing the same thing.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] text-lg py-6 px-10 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl">
                Join the Creative Community
              </Button>
            </motion.div>
          </div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 max-w-sm w-full"
          >
            <Badge variant="secondary" className="bg-[#e2e240] text-[#0a0a1e] mb-3">
              Now Covering
            </Badge>
            <h3 className="text-2xl font-semibold text-gray-100 mb-2">Killing in the Name Of</h3>
            <p className="text-lg text-gray-300 mb-4">by Rage Against the Machine</p>
            <p className="text-sm text-gray-400 mb-4">Round 23 - covers due Tuesday, Sep 17th</p>
            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
                Submit your cover
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col items-center space-y-6 max-w-3xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-8 border border-gray-700"
        >
          <h3 className="text-2xl font-semibold text-gray-100 flex items-center">
            <Headphones className="mr-2 h-6 w-6 text-[#e2e240]" />
            Get notified for the next round
          </h3>
          <p className="text-center text-gray-300">
            Want in? Sign up with your email. It's free, and we do this every quarter.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240]"
            />
            <Button type="submit" className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050]">
              Sign Up
            </Button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-3xl mx-auto w-full"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-100 flex items-center">
            <Disc className="mr-2 h-7 w-7 text-[#e2e240] animate-spin-slow" />
            Previous Rounds
          </h2>
          <div className="space-y-4">
            {[
              { number: 22, song: "Who Loves The Sun", artist: "The Velvet Underground" },
              { number: 21, song: "California Dreamin", artist: "The mamas and the papas" },
            ].map((round, index) => (
              <motion.div 
                key={round.number}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
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
            <PreviousRounds/>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
