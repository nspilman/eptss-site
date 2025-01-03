'use server';

import { createClient } from "@/utils/supabase/server";


type WaitlistInput = {
  email: string;
  name: string;
};

export async function addToWaitlist({ email, name }: WaitlistInput) {
  const supabase = await createClient();

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('mailing_list')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error("This email is already on our waitlist");
    }

    // Add to mailing list
    const { error } = await supabase
      .from('mailing_list')
      .insert([
        {
          email,
          name,
        }
      ]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
} 