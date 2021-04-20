import { AutoThemeProvider } from "@devtools-ds/themes";
import type { AppProps } from "next/app";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <AutoThemeProvider autoStyle>
      <Component {...pageProps} />
    </AutoThemeProvider>
  );
}

export default MyApp;
