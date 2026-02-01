"use server"

import { getAuthUser } from "./getAuthUser"
import { checkIsAdmin } from "./supabase-server"

/**
 * Server action to check if current user is admin
 * Delegates to the checkIsAdmin policy function
 */
export const isAdmin = async (): Promise<boolean> => {
    const { email } = await getAuthUser()
    // Honest absence: null email means not authenticated, not admin
    if (!email) {
        return false
    }
    return checkIsAdmin(email)
}