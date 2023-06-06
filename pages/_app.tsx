import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header } from "../components/shared/Header";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { theme } from "styles";
import { Footer } from "components/shared/Footer";
import { UserSessionProvider } from "components/context/UserSessionContext";
import { RoundProvider } from "components/context/RoundContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <ChakraProvider theme={theme}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <RoundProvider>
          <UserSessionProvider>
            <Header />
            <Component {...pageProps} />
            <Footer />
          </UserSessionProvider>
        </RoundProvider>
      </SessionContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
