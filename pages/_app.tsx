import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header } from "../components/shared/Header";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  const theme = extendTheme(
    {
      components: {
        Card: {
          baseStyle: {
            bg: "blue",
            color: "white",
          },
        },
      },
      colors: {
        primary: "blue",
      },
      styles: {
        global: {
          body: {
            background:
              "linear-gradient(rgba(28, 32, 38, 0.9), rgba(183, 192, 209, 0.9)), url('https://images.unsplash.com/photo-1458560871784-56d23406c091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80') fixed",
            backgroundCovor: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            color: "white",
          },
        },
      },
    },
    withDefaultColorScheme({ colorScheme: "primary" })
  );

  return (
    <ChakraProvider theme={theme}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Header />
        <Component {...pageProps} />
      </SessionContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
