import React from "react";
import { FeedbackFormContainer } from "@/components/feedback/FeedbackFormContainer";
import { getAuthUser } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import FeedbackPageClient from "./FeedbackPageClient";

// Helper function to check authentication and redirect if not authenticated
async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login?redirect=/feedback');
  }
  
  return { userId: getAuthUser().userId };
}

export default async function FeedbackPage() {
  // Check authentication and get user ID
  const { userId } = await checkAuthentication();
  
  return (
    <FeedbackPageClient userId={userId} />
  );
}
