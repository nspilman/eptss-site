"use server"

import { getAuthUser } from "./supabase/server"

export const isAdmin = async () => {
    const {email} = await getAuthUser()
    if ((!email.length || email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) && process.env.NODE_ENV !== "development") {
        return false
    }
    return true
}