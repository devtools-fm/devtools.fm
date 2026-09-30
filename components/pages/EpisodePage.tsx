"use client";

import {
  ChevronLeftIcon,
  ClipboardIcon,
  ConsoleIcon,
  DataIcon,
  InfoIcon,
  ListIcon,
  MoreInfoIcon,
  NewWindowIcon,
} from "@devtools-ds/icon";
import { Navigation } from "@devtools-ds/navigation";
import { titleCase } from "title-case";
import { useState } from "react";

import { Browser } from "components/Browser";
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

const MdxPanel = ({ html }: { html: string }) => {
  return (
    <Navigation.Panel className="mx-3 my-4 focus:outline-none dark:text-gray-200">
      <div
        className="episode-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Navigation.Panel>
  );
};

const SectionsPanel = ({ sections }: SectionsTab) => {
  return (
    <Navigation.Panel className="mx-3 my-4 focus:outline-none dark:text-gray-300">
      {sections.map((section) => (
        <div key={section.time} className="space-x-2">
          <ColoredText color="purple">{section.time}</ColoredText>
          <span>{section.title}</span>
        </div>
      ))}
    </Navigation.Panel>
  );
};

function renderTabPanel(tabSection: TabSection) {
  if ("sections" in tabSection) {
    return <SectionsPanel key={tabSection.type} {...tabSection} />;
  }

  return (
    <MdxPanel
      key={tabSection.type}
      html={tabSection.html}
    />
  );
}

const sponsorLogos: Record<string, { src: string; url: string }> = {
  Macro: { src: "/macro-logo.png", url: "https://www.macro.com" },
};

interface EpisodeClientProps {
  youtubeId: string;
  tabSections: TabSection[];
  episodeNumberString: string;
  title: string;
  spotifyEpisodeId?: string;
  spotifyEpisodeIdAlt?: string;
  sponsor?: string | string[];
}

export default function EpisodeClient({
  youtubeId,
  tabSections,
  episodeNumberString,
  title,
  spotifyEpisodeId,
  spotifyEpisodeIdAlt,
  sponsor,
}: EpisodeClientProps) {
  const sponsors = sponsor
    ? (Array.isArray(sponsor) ? sponsor : [sponsor])
    : [];

  const [activeTab, setActiveTab] = useState(() => {
    const view =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("view");

    if (view === "youtube") return tabSections.length;
    if (view) {
      const tabIndex = tabSections.findIndex(
        (tab) => tab.type === view.toUpperCase()
      );
      if (tabIndex >= 0) return tabIndex;
    }

    return 0;
  });

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
          className="mb-8 md:mb-12"
          src={`https://podcasters.spotify.com/pod/show/devtoolsfm/embed/episodes/${spotifyEpisodeId}`}
          height="161px"
          width="100%"
          frameBorder="0"
          scrolling="no"
        />
      ) : (
        spotifyEpisodeIdAlt && (
          <iframe
            className="mb-8 md:mb-12"
            src={`https://open.spotify.com/embed/episode/${spotifyEpisodeIdAlt}?utm_source=generator`}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            height="161px"
            width="100%"
            loading="lazy"
            frameBorder="0"
            scrolling="no"
          />
        )
      )}

      <Browser>
      <Navigation
        index={activeTab}
        onChange={(index) => {
          const newView =
            index === tabSections.length
              ? "youtube"
              : tabSections[index].type.toLowerCase();

          const url = new URL(window.location.href);
          url.searchParams.set("view", newView);
          window.history.pushState({}, "", url);
          setActiveTab(index);
        }}
      >
        <Navigation.Controls className="overflow-x-auto">
          <Navigation.TabList>
            <>
              {tabSections.map((tabSection) => (
                <Navigation.Tab
                  key={tabSection.type}
                  id="about"
                  icon={getTabIcon(tabSection.type)}
                >
                  {titleCase(tabSection.type.toLowerCase())}
                </Navigation.Tab>
              ))}
              <Navigation.Tab id="youtube" icon={<ConsoleIcon inline />}>
                YouTube
              </Navigation.Tab>
            </>
          </Navigation.TabList>

          <Navigation.Right>
            <Navigation.Button
              icon={<NewWindowIcon inline />}
              aria-label="New Window"
            />

            <Navigation.Divider />
            <Navigation.Button
              icon={<MoreInfoIcon inline />}
              aria-label="More settings"
            />
          </Navigation.Right>
        </Navigation.Controls>
        <Navigation.Panels>
          {tabSections.map(renderTabPanel)}

          <Navigation.Panel className="mx-3 mb-4 focus:outline-none">
            <div className="relative pb-[56.25%]">
              <iframe
                allowFullScreen
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                className="absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </Navigation.Panel>
        </Navigation.Panels>
      </Navigation>
      </Browser>
    </Page>
  );
}