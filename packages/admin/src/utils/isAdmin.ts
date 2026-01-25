"use server"

import { createClient } from "@eptss/core/utils/supabase/server"

export const isAdmin = async () => {
    try {
        // Get the Supabase client
        const supabase = await createClient()

        // Get the authenticated user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user || !user.email) {
            console.log('isAdmin: No authenticated user found', error)
            return false
        }

        const email = user.email

        // Check if the user's email matches the admin email
        const isAdminEmail = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
        const isDevelopment = process.env.NODE_ENV === "development"

        if (!isAdminEmail && !isDevelopment) {
            console.log('isAdmin: User is not admin', email, process.env.NEXT_PUBLIC_ADMIN_EMAIL)
            return false
        }

        return true
    } catch (error) {
        console.error('isAdmin: Error checking admin status', error)
        return false
    }
}
