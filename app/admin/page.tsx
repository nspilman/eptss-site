import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation";

const AdminPage = async () => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if(!data.user || data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL){
        return notFound()
    }
    return <div> ADMIN PAGE </div>
}

export default AdminPage;