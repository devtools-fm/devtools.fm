import {
  ChevronLeftIcon,
  ClipboardIcon,
  ConsoleIcon,
  DataIcon,
  InfoIcon,
  ListIcon,
} from "@devtools-ds/icon";
import { titleCase } from "title-case";
import type { ReactNode } from "react";

import { Browser } from "components/Browser";
import {
  NavControls,
  NavIcon,
  navClassName,
  tabClassName,
  tabListClassName,
} from "components/BrowserNav";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import type { SectionsTab, TabSection } from "utils/processMdx";

function getTabIcon(type: string) {
  switch (type) {
    case "SHOW NOTES":
      return <InfoIcon inline />;
    case "SECTIONS":
      return <ListIcon inline />;
    case "TRANSCRIPT":
      return <ClipboardIcon inline />;
    default:
      return <DataIcon inline />;
  }
}

// `html` is produced at build time by renderMarkdown() in utils/processMdx.ts
// from the repo's own episode files. remark-rehype runs without
// allowDangerousHtml, so raw HTML in the source is dropped, not passed through.
const MdxPanel = ({ html }: { html: string }) => (
  <div className="mx-3 my-4 dark:text-gray-200">
    <div className="episode-content" dangerouslySetInnerHTML={{ __html: html }} />
  </div>
);

const SectionsPanel = ({ sections }: Pick<SectionsTab, "sections">) => (
  <div className="mx-3 my-4 dark:text-gray-300">
    {sections.map((section) => (
      <div key={section.time} className="space-x-2">
        <ColoredText color="purple">{section.time}</ColoredText>
        <span>{section.title}</span>
      </div>
    ))}
  </div>
);

const YouTubePanel = ({ youtubeId }: { youtubeId: string }) => (
  <div className="mx-3 mb-4">
    <div className="relative pb-[56.25%]">
      <iframe
        allowFullScreen
        width="100%"
        height="100%"
        // Lazy so the hidden panel doesn't load the player until it's shown.
        loading="lazy"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video player"
        className="absolute inset-0 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  </div>
);

interface EpisodeTab {
  /** The `?view=` value for this tab. */
  view: string;
  label: string;
  icon: ReactNode;
  panel: ReactNode;
}

const tabId = (view: string) => `episode-tab-${view.replace(/\W+/g, "-")}`;
const panelId = (view: string) => `episode-panel-${view.replace(/\W+/g, "-")}`;

/**
 * Server-rendered devtools-style tabs. The first tab is selected in the HTML;
 * the script in src/pages/episode/[episodeNumber].astro handles switching,
 * ?view= syncing, and keyboard navigation (data-episode-tabs).
 *
 * As on the Next.js site, the selected tab is marked only by the underline
 * from `.devtools-tablist` (aria-selected), not devtools-ds' blue selected style.
 */
const EpisodeTabs = ({ tabs }: { tabs: EpisodeTab[] }) => (
  <nav className={navClassName} data-episode-tabs>
    <NavControls>
      <div role="tablist" className={tabListClassName}>
        {tabs.map((tab, index) => (
          <button
            key={tab.view}
            type="button"
            role="tab"
            id={tabId(tab.view)}
            aria-controls={panelId(tab.view)}
            aria-selected={index === 0}
            tabIndex={index === 0 ? 0 : -1}
            data-view={tab.view}
            className={tabClassName(false)}
          >
            <NavIcon>{tab.icon}</NavIcon>
            <div>{tab.label}</div>
          </button>
        ))}
      </div>
    </NavControls>
    {tabs.map((tab, index) => (
      <div
        key={tab.view}
        role="tabpanel"
        id={panelId(tab.view)}
        aria-labelledby={tabId(tab.view)}
        tabIndex={0}
        hidden={index !== 0}
        className="focus:outline-none"
      >
        {tab.panel}
      </div>
    ))}
  </nav>
);

const sponsorLogos: Record<string, { src: string; url: string }> = {
  Macro: { src: "/macro-logo.png", url: "https://www.macro.com" },
};

interface EpisodePageProps {
  youtubeId: string;
  tabSections: TabSection[];
  episodeNumberString: string;
  title: string;
  spotifyEpisodeId?: string;
  spotifyEpisodeIdAlt?: string;
  sponsor?: string | string[];
}

export default function EpisodePage({
  youtubeId,
  tabSections,
  episodeNumberString,
  title,
  spotifyEpisodeId,
  spotifyEpisodeIdAlt,
  sponsor,
}: EpisodePageProps) {
  const sponsors = sponsor
    ? (Array.isArray(sponsor) ? sponsor : [sponsor])
    : [];

  const tabs: EpisodeTab[] = [
    ...tabSections.map((tabSection) => ({
      view: tabSection.type.toLowerCase(),
      label: titleCase(tabSection.type.toLowerCase()),
      icon: getTabIcon(tabSection.type),
      panel:
        "sections" in tabSection ? (
          <SectionsPanel sections={tabSection.sections} />
        ) : (
          <MdxPanel html={tabSection.html} />
        ),
    })),
    {
      view: "youtube",
      label: "YouTube",
      icon: <ConsoleIcon inline />,
      panel: <YouTubePanel youtubeId={youtubeId} />,
    },
  ];

  return (
    <Page>
      <a
        className="py-4 flex items-center space-x-2 hover:pointer"
        href="/episodes"
      >
        <ChevronLeftIcon size="medium" />
        <span className="text-lg">All episodes</span>
      </a>

      <ColoredText className="mt-4" color="blue">
        {episodeNumberString}:
      </ColoredText>
      <h1 className="text-xl md:text-3xl mt-2 mb-8 md:mb-12">
        {title}
      </h1>

      {sponsors.length > 0 && (
        <div className="flex items-center gap-3 mb-8 md:mb-12 text-sm dark:text-gray-400 text-gray-500">
          <span>Sponsored by</span>
          {sponsors.map((name) => {
            const logo = sponsorLogos[name];
            return logo ? (
              <a
                key={name}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <img src={logo.src} alt={name} className="h-6" />
              </a>
            ) : (
              <span key={name} className="font-semibold dark:text-gray-200 text-gray-700">{name}</span>
            );
          })}
        </div>
      )}

      {spotifyEpisodeId ? (
        <iframe
          className="mb-8 md:mb-12 border-0 overflow-hidden"
          src={`https://podcasters.spotify.com/pod/show/devtoolsfm/embed/episodes/${spotifyEpisodeId}`}
          height="161px"
          width="100%"
        />
      ) : (
        spotifyEpisodeIdAlt && (
          <iframe
            className="mb-8 md:mb-12 border-0 overflow-hidden"
            src={`https://open.spotify.com/embed/episode/${spotifyEpisodeIdAlt}?utm_source=generator`}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            height="161px"
            width="100%"
            loading="lazy"
          />
        )
      )}

      <Browser>
        <EpisodeTabs tabs={tabs} />
      </Browser>
    </Page>
  );
}
