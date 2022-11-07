import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header } from "../components/Homepage/Header";
import * as styles from "./_app.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <body className={styles.body}>
      <Header />
      <div>
        <Component {...pageProps} />
      </div>
    </body>
  );
}

export default MyApp;
