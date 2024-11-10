"use server"

import { userSessionProvider } from "@/providers"

export const isAdmin = async () => {
    const { email } = await userSessionProvider()
    if ((!email.length || email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) && process.env.NODE_ENV !== "development") {
        return false
    }
    return true
}