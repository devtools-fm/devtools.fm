import { Providers } from "./providers";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "@reach/tabs/styles.css";

export const metadata = {
  title: 'devtools.fm',
  description: 'A podcast about developer tools and the people who make them',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}