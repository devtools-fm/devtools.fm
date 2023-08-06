import makeClass from "clsx";

interface ActionLinkProps {
  src: string;
  href: string;
  text: string;
}

export const PODCAST_LINKS: ActionLinkProps[] = [
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

export function LinkShieldList() {
  return (
    <ul className="flex space-x-4 justify-center">
      {PODCAST_LINKS.map((link) => (
        <li key={link.href}>
          <a href={link.href} title={link.text}>
            <img
              src={link.src}
              className={makeClass(
                "h-12 w-12 rounded-xl",
                link.src === "/youtube.png" &&
                  "border border-gray-300 dark:border-none"
              )}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
