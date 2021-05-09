import { AutoThemeProvider } from "@devtools-ds/themes";
import makeClass from "clsx";
import Head from "next/head";

const PODCAST_LINKS: ActionLinkProps[] = [
  {
    src: "/apple.png",
    href: "https://podcasts.apple.com/podcast/id1566647758",
    text: "Apple Podcasts",
  },
  {
    src: "/spotify.png",
    href: "https://open.spotify.com/show/142I2b9HGjWhRgPXhOYUnN",
    text: "Spotify",
  },
  {
    src: "/youtube.png",
    href: "https://www.youtube.com/channel/UCFsRlOn7gODgv6WUriLrzXg",
    text: "YouTube",
  },
  {
    src: "/twitter.png",
    href: "https://twitter.com/devtoolsfm",
    text: "Twitter",
  },
  {
    src: "/rss.png",
    href: "https://feeds.buzzsprout.com/1772992.rss",
    text: "RSS Feed",
  },
];

interface ActionLinkProps {
  src: string;
  href: string;
  text: string;
}

const FooterLink = (
  props: Omit<React.ComponentProps<"a">, "target" | "rel" | "className">
) => {
  return <a {...props} target="_blank" rel="noopener" className="underline" />;
};

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center mb-12 md:mb-16 mt-8">
      <p>
        Copyright © {year}{" "}
        <FooterLink href="https://twitter.com/hipstersmoothie">
          Andrew Lisowski
        </FooterLink>
      </p>

      <ul className="flex space-x-4 justify-center my-8">
        {PODCAST_LINKS.map((link) => (
          <li>
            <FooterLink href={link.href} title={link.text}>
              <img
                src={link.src}
                className={makeClass(
                  "h-12 w-12 rounded-xl",
                  link.src === "/youtube.png" &&
                    "border border-gray-300 dark:border-none"
                )}
              />
            </FooterLink>
          </li>
        ))}
      </ul>

      <p className="text-sm mb-8">
        Built with <FooterLink href="https://nextjs.org">Next.js</FooterLink>
        {", "}
        <FooterLink href="https://github.com/intuit/devtools-ds">
          devtools-ds
        </FooterLink>{" "}
        and <FooterLink href="https://tailwindcss.com">tailwindcss</FooterLink>.
        Hosted on <FooterLink href="https://vercel.com">Vercel</FooterLink> and
        the source code is on{" "}
        <FooterLink href="https://github.com/devtools-fm/devtools.fm">
          GitHub
        </FooterLink>
        .
      </p>

      <p className="flex justify-center">
        <FooterLink href="https://vercel.com?utm_source=devtools-fm&utm_campaign=oss">
          <img src="/vercel.svg" />
        </FooterLink>
      </p>
    </footer>
  );
};

interface PageProps {
  children: React.ReactNode;
}

export const Page = ({ children }: PageProps) => {
  return (
    <AutoThemeProvider autoStyle>
      <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-6">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col flex-1">{children}</main>

        <Footer />
      </div>
    </AutoThemeProvider>
  );
};
