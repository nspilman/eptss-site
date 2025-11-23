"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MusicIcon, Disc3, Home } from "lucide-react"
import { Button } from "@eptss/ui"

export function NotFoundClient() {
  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans flex flex-col justify-center items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        <MusicIcon className="mx-auto mb-6 h-16 w-16 text-[var(--color-accent-primary)]" />
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            404
          </span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]">
            Page Not Found
          </span>
        </h2>
        <p className="text-xl mb-8">
          Oops! Looks like this track skipped. Let&apos;s get you back to the playlist.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex justify-center"
        >
          <Button variant="secondary" size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-16 relative"
      >
        <Disc3 className="text-[var(--color-accent-primary)] animate-spin-slow h-32 w-32 opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
          404
        </div>
      </motion.div>
    </div>
  )
}
