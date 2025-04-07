"use server";
import { createClient } from "@/utils/supabase/server";


export const signOut = async () => {
  const supabaseClient = await createClient();
  await supabaseClient.auth.signOut();
};

export const signInWithOTP = async ({
  email,
  redirectUrl,
}: {
  email: string;
  redirectUrl?: string;
}) => {
  const supabaseClient = await createClient();
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email?.trim() || "",
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectUrl ?? "/",
    },
  });
  return { error };
};

export const signInWithPassword = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const supabaseClient = await createClient();
  
  // First, find the user's email by username
  const { data: userData, error: userError } = await supabaseClient
    .from("users")
    .select("email")
    .eq("username", username)
    .single();

  if (userError || !userData) {
    return { error: { message: "Invalid username or password" } };
  }
  
  // Sign in with the email and password
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: userData.email,
    password,
  });
  
  return { data, error };
};

export const signUpWithPassword = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const supabaseClient = await createClient();
  
  try {
    // Check if username already exists
    const { data: existingUserByUsername } = await supabaseClient
      .from("users")
      .select("userid")
      .eq("username", username)
      .single();
      
    if (existingUserByUsername) {
      return { error: { message: "Username already exists" } };
    }
    
    // Check if email already exists
    const { data: existingUserByEmail } = await supabaseClient
      .from("users")
      .select("userid")
      .eq("email", email)
      .single();
      
    if (existingUserByEmail) {
      return { error: { message: "Email already in use" } };
    }
    
    // Sign up with email and password
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    
    if (error) {
      return { error };
    }
    
    if (!data?.user) {
      return { error: { message: "Failed to create user account" } };
    }
    
    // Create the user record in the users table
    const { error: insertError } = await supabaseClient
      .from("users")
      .insert({
        userid: data.user.id,
        email: email,
        username: username,
      });
      
    if (insertError) {
      // If there was an error creating the user record, delete the auth user
      await supabaseClient.auth.admin.deleteUser(data.user.id);
      return { error: { message: "Failed to create user profile. Please try again." } };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: { message: "An unexpected error occurred during registration" } };
  }
};
