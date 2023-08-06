import makeClass from "clsx";

interface ActionLinkProps {
  src: string;
  href: string;
  text: string;
}

export const PODCAST_LINKS: ActionLinkProps[] = [
  {
    src: "/youtube.png",
    href: "https://www.youtube.com/channel/UCFsRlOn7gODgv6WUriLrzXg",
    text: "YouTube",
  },
  {
    src: "/platform-logos/apple.svg",
    href: "https://podcasts.apple.com/podcast/id1566647758",
    text: "Apple Podcasts",
  },
  {
    src: "/platform-logos/spotify.svg",
    href: "https://open.spotify.com/show/142I2b9HGjWhRgPXhOYUnN",
    text: "Spotify",
  },
  {
    src: "/platform-logos/google.svg",
    href: "https://podcasts.google.com/feed/aHR0cHM6Ly9mZWVkcy5idXp6c3Byb3V0LmNvbS8xNzcyOTkyLnJzcw",
    text: "Google Podcasts",
  },
  {
    src: "/platform-logos/rss.svg",
    href: "https://feeds.buzzsprout.com/1772992.rss",
    text: "RSS Feed",
  },
  {
    src: "/platform-logos/overcast.svg",
    href: "https://overcast.fm/itunes1566647758",
    text: "Overcast",
  },
  {
    src: "/platform-logos/podcastaddict.svg",
    href: "https://podcastaddict.com/podcast/devtoolsfm/4364149",
    text: "Podcast Addict",
  },
  {
    src: "/platform-logos/pocketcasts.svg",
    href: "https://pca.st/vxter35a",
    text: "Pocket Casts",
  },
  {
    src: "/platform-logos/castbox.svg",
    href: "https://castbox.fm/channel/5372639?utm_campaign=ex_share_ch&utm_medium=exlink&country=us",
    text: "Castbox",
  },
  {
    src: "/platform-logos/podbean.svg",
    href: "https://www.podbean.com/podcast-detail/qnptn-1eff3b/devtools.fm-Podcast",
    text: "Podbean",
  },
  {
    src: "/platform-logos/iheartradio.svg",
    href: "https://www.iheart.com/podcast/269-devtoolsfm-82299412/",
    text: "iheartradio",
  },
  {
    src: "/platform-logos/podcastrepublic.svg",
    href: "https://www.podcastrepublic.net/podcast/1566647758",
    text: "Podcast Republic",
  },
  {
    src: "/platform-logos/playerfm.svg",
    href: "https://player.fm/subscribe?id=https%3A%2F%2Fanchor.fm%2Fs%2Fdd6922b4%2Fpodcast%2Frss",
    text: "Player FM",
  },
  {
    src: "/platform-logos/castro.svg",
    href: "https://castro.fm/podcast/ce2215da-fa46-42be-bf12-79231f73faf0",
    text: "Castro",
  },
  {
    src: "/platform-logos/radiopublic.svg",
    href: "https://radiopublic.com/devtoolsfm-Wxgomg",
    text: "Radio Public",
  },
];

export function LinkShieldList({ limit }: { limit?: number }) {
  return (
    <ul className="flex flex-wrap gap-4 justify-center max-w-xs mx-auto">
      {PODCAST_LINKS.slice(0, limit || PODCAST_LINKS.length).map((link) => (
        <li key={link.href}>
          <a
            target="_blank"
            rel="noopener"
            href={link.href}
            className={`plausible-event-name=Shield+Click plausible-event-position=${link.text.replace(
              / /g,
              "+"
            )}`}
            title={link.text}
          >
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
