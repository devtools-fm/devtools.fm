import { AutoThemeProvider } from "@devtools-ds/themes";
import makeClass from "clsx";

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
  props: Omit<React.ComponentProps<"a">, "target" | "rel">
) => {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener"
      className={`underline ${props.className}`}
    />
  );
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
          <li key={link.href}>
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

      <p className="flex flex-col justify-center items-center">
        <span className="flex ml-6 items-center mb-6">
          Scheduled with
          <FooterLink
            className="ml-2"
            href="https://savvycal.com?utm_source=devtools-fm"
          >
            <svg
              savvy-cal
              width="124"
              height="32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="currentColor" fill-rule="evenodd">
                <path d="M13.29.71c12.26-2.16 15.792.217 17.972 12.586 2.181 12.368-.038 15.76-12.583 17.973C6.133 33.48 2.889 31.056.707 18.684-1.474 6.312 1.032 2.873 13.291.71zm1.413 5.465c-2.347.414-4.044 1.492-5.02 3.058-.767 1.23-1.011 2.671-.79 3.838.489 2.573 2.613 4.193 6.917 4.52l.336.024.334.027.318.03c1.5.15 2.46.405 2.99.733.354.218.496.456.597 1.033.193 1.095-.66 2.087-2.906 2.483-1.485.262-3.07-.053-4.803-.998a1.875 1.875 0 10-1.795 3.293c2.445 1.333 4.879 1.817 7.25 1.399 4.139-.73 6.533-3.51 5.948-6.828-.556-3.151-2.778-4.557-7.68-4.914l-.323-.023c-1.579-.121-2.567-.428-3.089-.818-.258-.194-.353-.365-.41-.66-.049-.263.033-.745.288-1.155.392-.628 1.156-1.113 2.49-1.348 1.182-.209 2.325-.008 3.496.628a1.875 1.875 0 101.791-3.295c-1.903-1.035-3.905-1.386-5.939-1.027z"></path>
                <path
                  d="M44.984 22.525c2.794 0 4.751-1.471 4.751-3.943v-.037c0-2.189-1.444-3.189-4.257-3.868-2.566-.603-3.174-1.056-3.174-2.075v-.038c0-.867.798-1.565 2.167-1.565 1.045 0 2.033.34 3.06 1 .19.113.38.17.608.17.608 0 1.102-.472 1.102-1.076 0-.453-.247-.774-.513-.925-1.197-.792-2.547-1.226-4.22-1.226-2.641 0-4.541 1.566-4.541 3.83v.038c0 2.433 1.596 3.263 4.428 3.943 2.47.565 3.002 1.075 3.002 2.018v.038c0 .98-.912 1.66-2.356 1.66-1.445 0-2.623-.49-3.725-1.358-.152-.113-.361-.208-.684-.208-.608 0-1.103.472-1.103 1.076 0 .377.19.698.457.886a8.323 8.323 0 004.998 1.66zm10.096.02c1.539 0 2.584-.642 3.268-1.453v.377c0 .51.457.962 1.122.962.627 0 1.121-.472 1.121-1.094v-4.905c0-1.302-.342-2.358-1.083-3.075-.703-.717-1.825-1.113-3.326-1.113-1.311 0-2.28.226-3.231.585a.997.997 0 00-.627.905c0 .528.437.943.97.943a1.3 1.3 0 00.36-.056c.627-.246 1.35-.396 2.224-.396 1.615 0 2.49.754 2.49 2.17v.244a8.44 8.44 0 00-2.7-.415c-2.45 0-4.142 1.057-4.142 3.207v.038c0 2 1.672 3.075 3.554 3.075zm.646-1.66c-1.103 0-1.958-.548-1.958-1.51v-.038c0-1.038.874-1.66 2.357-1.66.912 0 1.691.17 2.28.396v.68c0 1.263-1.159 2.131-2.68 2.131zm11.445 1.64c.627 0 1.045-.415 1.311-1l3.345-7.621a1.36 1.36 0 00.133-.547c0-.623-.494-1.094-1.121-1.094-.608 0-.912.396-1.083.792l-2.623 6.64-2.585-6.602c-.19-.472-.513-.83-1.14-.83-.627 0-1.14.528-1.14 1.094 0 .207.076.396.133.566l3.345 7.602c.266.604.684 1 1.31 1h.115zm10.818 0c.627 0 1.045-.415 1.311-1l3.345-7.621a1.36 1.36 0 00.133-.547c0-.623-.494-1.094-1.121-1.094-.608 0-.912.396-1.083.792l-2.623 6.64-2.585-6.602c-.19-.472-.513-.83-1.14-.83-.627 0-1.14.528-1.14 1.094 0 .207.076.396.133.566l3.344 7.602c.267.604.685 1 1.312 1h.114zm8.461 2.887c1.616 0 2.528-.755 3.383-2.792l3.668-8.735c.038-.113.095-.358.095-.547 0-.604-.494-1.075-1.102-1.075-.59 0-.913.396-1.103.867l-2.508 6.622-2.699-6.622c-.209-.528-.532-.867-1.121-.867-.646 0-1.14.471-1.14 1.113 0 .15.056.377.133.547l3.724 8.263-.076.207c-.38.774-.74 1.057-1.425 1.057-.323 0-.532-.057-.798-.132-.114-.038-.228-.076-.418-.076a.922.922 0 00-.931.944c0 .547.38.83.722.943.475.188.95.283 1.596.283zm15.74-2.849c2.148 0 3.573-.68 4.828-1.773.209-.189.38-.472.38-.83 0-.585-.513-1.076-1.103-1.076-.285 0-.532.114-.703.264-.969.812-1.92 1.264-3.326 1.264-2.546 0-4.39-2.094-4.39-4.678v-.038c0-2.585 1.863-4.66 4.39-4.66 1.274 0 2.262.453 3.174 1.189.152.113.38.226.703.226.647 0 1.16-.49 1.16-1.132 0-.415-.21-.735-.456-.924-1.16-.887-2.509-1.49-4.562-1.49-4.029 0-6.86 3.075-6.86 6.829v.038c0 3.791 2.888 6.791 6.765 6.791zm10.438-.019c1.54 0 2.585-.641 3.27-1.452v.377c0 .51.455.962 1.12.962.628 0 1.122-.472 1.122-1.094v-4.905c0-1.302-.342-2.358-1.084-3.075-.703-.717-1.824-1.113-3.325-1.113-1.312 0-2.281.226-3.231.585a.997.997 0 00-.628.905c0 .528.438.943.97.943a1.3 1.3 0 00.36-.056c.628-.246 1.35-.396 2.224-.396 1.616 0 2.49.754 2.49 2.17v.244a8.44 8.44 0 00-2.699-.415c-2.451 0-4.143 1.057-4.143 3.207v.038c0 2 1.673 3.075 3.554 3.075zm.646-1.66c-1.102 0-1.957-.547-1.957-1.51v-.037c0-1.038.874-1.66 2.356-1.66.913 0 1.692.17 2.281.396v.68c0 1.263-1.16 2.131-2.68 2.131zm8.86 1.547c.647 0 1.16-.49 1.16-1.132V9.603c0-.623-.513-1.132-1.16-1.132-.645 0-1.14.509-1.14 1.132v11.696c0 .642.514 1.132 1.14 1.132z"
                  fill-rule="nonzero"
                ></path>
              </g>
            </svg>
          </FooterLink>
        </span>
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
    <AutoThemeProvider theme="firefox" autoStyle>
      <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-6">
        <main className="flex flex-col flex-1">{children}</main>

        <Footer />
      </div>
    </AutoThemeProvider>
  );
};
