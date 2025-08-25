"use server";

import { signupUserWithoutSong } from "@/data-access";
import { FormReturn } from "@/types";
import { revalidatePath } from "next/cache";
import { Navigation } from "@/enum/navigation";

export async function signupForRound(formData: FormData) {
  const roundId = parseInt(formData.get("roundId") as string, 10);
  const userId = formData.get("userId") as string;
  
  if (!userId || !roundId) {
    throw new Error("Missing required information");
  }
  
  try {
    const result = await signupUserWithoutSong({ 
      roundId, 
      userId
    });

    // Revalidate the dashboard page to show updated status
    revalidatePath(Navigation.Dashboard);
    
    // Success case - just revalidate, no return value needed
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

// Wrapper function for client-side usage that returns values
export async function signupForRoundWithResult(formData: FormData): Promise<FormReturn> {
  try {
    await signupForRound(formData);
    return { status: "Success", message: "You have successfully signed up for this round" };
  } catch (error) {
    return { status: "Error", message: (error as Error).message };
  }
}
