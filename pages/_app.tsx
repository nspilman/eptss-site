import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header } from "../components/shared/Header";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <Header />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;
