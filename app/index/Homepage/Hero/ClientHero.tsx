"use client"
import { Button } from "@/components/ui/button";
import { Navigation } from "@/enum/navigation";
import { motion } from "framer-motion";

export const ClientHero = () => (
    <div className="w-full flex flex-col justify-center min-h-screen text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        <div className="">
        <div className="bg-[#e2e240] inline-block py-1">
          <span className="text-4xl md:text-5xl font-bold text-gray-900">
            creative fulfillment
          </span>
        </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#40e2e2] to-[#e2e240] -mt-1">
            with fewer decisions
          </p>
        </div>
        </h2>
        <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300" style={{ willChange: "auto", transform: "none" , opacity: 1}} >
          Sign up with a song you want to cover. Everyone votes, and the most
          popular is the song that everyone plays. You've got a creative
          assignment, a deadline and a community of musicians doing the same
          thing.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            className="bg-[#e2e240] text-[#0a0a1e] hover:bg-[#f0f050] text-lg py-6 px-10 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = Navigation.SignUp}
          >
            Join the Creative Community
          </Button>
        </motion.div>
      </motion.div>
    </div>)