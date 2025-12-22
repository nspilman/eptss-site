"use client";

import React from "react";
import Link from "next/link";
import { routes } from "@eptss/routing";
import { MusicIcon, Github, Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[var(--color-background-secondary)] mt-16 py-12 border-t border-[var(--color-gray-800)] flex flex-col w-screen">
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
                <Link href={routes.home({ hash: 'how-it-works' })} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href={routes.faq()} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={routes.dashboard.root()} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="text-[var(--color-white)] font-bold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link href={routes.auth.login()} className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-[var(--color-gray-800)] flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--color-gray-400)] text-sm">
            &copy; {currentYear} Everyone Plays The Same Song. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center text-[var(--color-gray-400)] text-sm gap-2 md:gap-6">
            <span className="flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 text-[var(--color-accent-primary)]" /> by musicians, for musicians
            </span>
            <span className="flex items-center gap-4 md:ml-6">
              <Link href="/privacy-policy" className="hover:text-[var(--color-accent-primary)] transition-colors underline underline-offset-2">
                Privacy Policy
              </Link>
              <span className="mx-1">|</span>
              <Link href="/terms-of-service" className="hover:text-[var(--color-accent-primary)] transition-colors underline underline-offset-2">
                Terms of Service
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
