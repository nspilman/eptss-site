"use server";

import { signupUserWithoutSong } from "@/data-access";
import { FormReturn } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Navigation } from "@/enum/navigation";

export async function signupForRound(formData: FormData) {
  const roundId = parseInt(formData.get("roundId") as string, 10);
  const userId = formData.get("userId") as string;
  
  if (!userId || !roundId) {
    return { success: false, error: "Missing required information" };
  }
  
  try {
    const result = await signupUserWithoutSong({ 
      roundId, 
      userId
    });

    // Revalidate the dashboard page to show updated status
    revalidatePath(Navigation.Dashboard);
    
    return { success: true, message: "You have successfully signed up for this round" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
