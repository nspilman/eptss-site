import { createClient } from '@/utils/supabase/server';
import { SupabaseClient, User } from '@supabase/supabase-js';

export async function ensureUserExists(user: User, supabaseClient?: SupabaseClient) {
  try {
    // Use the provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    // Check if the user already exists in the users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('userid')
      .eq('userid', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error checking if user exists:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // If the user doesn't exist, create a new record
    if (!existingUser) {
      // Make sure we have an email
      if (!user.email) {
        console.error('Cannot create user record: Email is missing');
        return { success: false, error: 'Email is missing' };
      }
      
      console.log('Creating new user record for:', user.email);
      
      // Extract username from email (before the @)
      const username = user.email.split('@')[0];
      
      // Add a retry mechanism for creating the user
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      let lastError = null;
      
      while (!success && retryCount < maxRetries) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            userid: user.id,
            email: user.email,
            username: username,
          });
          
        if (insertError) {
          console.error(`Error creating user record (attempt ${retryCount + 1}):`, insertError);
          lastError = insertError;
          retryCount++;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('Successfully created user record');
          success = true;
          return { success: true };
        }
      }
      
      if (!success) {
        console.error('Failed to create user record after multiple attempts');
        return { success: false, error: lastError };
      }
    } else {
      console.log('User already exists in database');
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return { success: false, error };
  }
}
