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
    .eq("email", username)
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
  
  // Check if username already exists
  const { data: existingUser, error: checkError } = await supabaseClient
    .from("users")
    .select("userid")
    .eq("username", username)
    .single();
    
  if (existingUser) {
    return { error: { message: "Username already exists" } };
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
  
  // If successful, create the user record in the users table
  if (data?.user && !error) {
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
      return { error: insertError };
    }
  }
  
  return { data, error };
};
