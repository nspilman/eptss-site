'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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
        console.log('Initial auth check:', data.session ? 'User is logged in' : 'No session');
        
        // If we have a session but are coming from a magic link or OAuth callback, force a refresh
        if (data.session && (pathname === '/' || pathname?.includes('/auth/callback'))) {
          console.log('Coming from auth callback, refreshing page');
          router.refresh();
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    // Check auth state immediately
    checkInitialAuthState();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      // Force a refresh of the page when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed, refreshing page');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname, searchParams]);

  return <>{children}</>;
}
