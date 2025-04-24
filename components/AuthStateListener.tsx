'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function AuthStateListener({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check for auth state immediately on component mount
    const checkInitialAuthState = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        // If we have a session but are coming from a magic link, force a refresh
        if (data.session && (pathname === '/' || pathname?.includes('/auth/callback'))) {
          router.refresh();
        }
        
        // If we have a session, check if the user exists in the users table
        if (data.session?.user) {
          await ensureUserExists(data.session.user);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    // Ensure the user exists in the public.users table
    const ensureUserExists = async (user: User) => {
      try {
        // Check if the user already exists in the users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('userid')
          .eq('userid', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          console.error('Error checking if user exists:', fetchError);
          return;
        }
        
        // If the user doesn't exist, create a new record
        if (!existingUser) {
          // Make sure we have an email
          if (!user.email) {
            console.error('Cannot create user record: Email is missing');
            return;
          }
          
          console.log('Creating new user record for:', user.email);
          
          // Extract username from email (before the @)
          const username = user.email.split('@')[0];
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              userid: user.id,
              email: user.email,
              username: username,
            });
            
          if (insertError) {
            console.error('Error creating user record:', insertError);
          } else {
            console.log('Successfully created user record');
          }
        }
      } catch (error) {
        console.error('Error ensuring user exists:', error);
      }
    };

    checkInitialAuthState();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      // If the user signed in, ensure they exist in the users table
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserExists(session.user);
      }
      
      // Force a refresh of the page when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname, searchParams]);

  return <>{children}</>;
}
