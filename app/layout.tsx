import { Providers } from "./providers";
import { getSequoiaPublicationUri } from "utils/sequoia";

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
  const publicationUri = getSequoiaPublicationUri();

  return (
    <html lang="en">
      <head>
        {publicationUri && (
          <link rel="site.standard.publication" href={publicationUri} />
        )}
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}