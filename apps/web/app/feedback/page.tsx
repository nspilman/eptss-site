import React from "react";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import FeedbackPageClient from "./FeedbackPageClient";


export default async function FeedbackPage() {
  const { userId } = await getAuthUser();
  
  return (
    <FeedbackPageClient userId={userId} />
  );
}
