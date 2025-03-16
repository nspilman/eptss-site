"use client";

import React from "react";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";
import { MusicIcon, Github, Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[var(--color-background-secondary)] mt-16 py-12 border-t border-[var(--color-gray-800)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <MusicIcon className="h-6 w-6 text-[var(--color-accent-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
                everyone plays the same song
              </span>
            </Link>
            <p className="text-[var(--color-gray-400)] max-w-md">
              A community of musicians covering the same song, each in their own unique style.
              Join us to collaborate, learn, and grow together.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://github.com/nspilman/eptss-site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--color-white)] font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href={Navigation.HowItWorks} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href={Navigation.FAQ} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={Navigation.Rounds} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  Past Rounds
                </Link>
              </li>
              <li>
                <Link href={Navigation.CurrentRound} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  Current Round
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="text-[var(--color-white)] font-bold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link href={Navigation.Login} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  Join Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/everyoneplaysthesamesong" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors"
                >
                  Discord Community
                </a>
              </li>
              <li>
                <a 
                  href="https://www.youtube.com/@everyoneplaysthesamesong/playlists" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors"
                >
                  Listen to Submissions
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-[var(--color-gray-800)] flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--color-gray-400)] text-sm">
            &copy; {currentYear} Everyone Plays The Same Song. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center text-[var(--color-gray-400)] text-sm">
            <span className="flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 text-[var(--color-accent-primary)]" /> by musicians, for musicians
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
