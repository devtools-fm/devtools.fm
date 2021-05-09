import { AutoThemeProvider } from "@devtools-ds/themes";
import Head from "next/head";

const FooterLink = (
  props: Omit<React.ComponentProps<"a">, "target" | "rel" | "className">
) => {
  return <a {...props} target="_blank" rel="noopener" className="underline" />;
};

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center mb-12 md:mb-16 mt-8">
      <p className="mb-6">
        Copyright © {year}{" "}
        <FooterLink href="https://twitter.com/hipstersmoothie">
          Andrew Lisowski
        </FooterLink>
        .{" "}
      </p>

      <p className="flex justify-center mb-6">
        <FooterLink href="https://vercel.com?utm_source=devtools-fm&utm_campaign=oss">
          <img src="/vercel.svg" />
        </FooterLink>
      </p>

      <p className="text-sm">
        Built with <FooterLink href="https://nextjs.org">Next.js</FooterLink>{" "}
        and <FooterLink href="https://tailwindcss.com">tailwindcss</FooterLink>.
        Hosted on <FooterLink href="https://vercel.com">Vercel</FooterLink> and
        the source code is on{" "}
        <FooterLink href="https://github.com/devtools-fm/devtools.fm">
          GitHub
        </FooterLink>
        .
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
