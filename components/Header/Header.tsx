"use client"

import React from "react";
import { motion } from "framer-motion";
import { MusicIcon, Menu, X, Info, Music, Users } from "lucide-react"
import Link from "next/link";
import { SignupButton } from "@/components/NavButtons";
import { Navigation } from "@/enum/navigation";
import { useState, useEffect } from "react";
import { NavLink } from "@/components/ui/nav-link";

interface Props {
  userId: string
}



export const Header = ({userId}: Props) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <MusicIcon className="h-8 w-8 text-[#e2e240] group-hover:text-[#f0f050] transition-colors" />
            </motion.div>
            <h1 className="text-sm sm:text-xl md:text-2xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
                everyone plays the same song
              </span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <NavLink 
                href={Navigation.HowItWorks} 
                label="How It Works" 
                icon={<Info className="h-4 w-4" />}
                variant="glowing"
              />
              <NavLink 
                href={Navigation.Rounds} 
                label="Rounds" 
                icon={<Music className="h-4 w-4" />}
              />
              <NavLink 
                href={Navigation.FAQ} 
                label="FAQ" 
                icon={<Info className="h-4 w-4" />}
              />
            </nav>
            
            <div className="pl-2 border-l border-gray-700">
              <SignupButton isLoggedIn={!!userId} />
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-[#e2e240] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 py-4 border-t border-gray-800"
          >
            <nav className="flex flex-col gap-2">
              <NavLink 
                href={Navigation.HowItWorks} 
                label="How It Works" 
                icon={<Info className="h-4 w-4" />}
                variant="glowing"
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavLink 
                href={Navigation.Rounds} 
                label="Rounds" 
                icon={<Music className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavLink 
                href={Navigation.FAQ} 
                label="FAQ" 
                icon={<Info className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="block md:hidden">
                  <SignupButton isLoggedIn={!!userId} />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>

  );
};
