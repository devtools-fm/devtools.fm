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
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { titleCase } from "title-case";
import { useState, useEffect, Suspense } from "react";

import { Browser } from "components/Browser";
import { ColoredText } from "components/ColoredText";
import { ThemedLink } from "components/ThemedLink";
import { Page } from "components/Page";
import { SectionsTab, ShowNotesTab, TranscriptTab } from "utils/processMdx";
import Link from "next/link";

const tabIcons = {
  "SHOW NOTES": <InfoIcon inline />,
  SECTIONS: <ListIcon inline />,
  TRANSCRIPT: <ClipboardIcon inline />,
} as const;

const mdxComponents = {
  a: (props) => <ThemedLink {...props} />,
  h2: (props) => <h2 {...props} className="text-2xl mb-4 mt-6" />,
  h3: (props) => <h3 {...props} className="text-xl my-4" />,
  h4: (props) => <h4 {...props} className="text-lg font-semibold underline" />,
  p: (props) => <p {...props} className="my-4" />,
  strong: (props) => (
    <ColoredText
      {...props}
      color={props.children.includes("Andrew") ? "blue" : "purple"}
    />
  ),
};

const MdxPanel = ({ mdx, components }: { mdx: MDXRemoteSerializeResult, components?: any }) => {
  return (
    <Navigation.Panel className="mx-3 my-4 focus:outline-none dark:text-gray-200">
      <MDXRemote {...mdx} components={components} />
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

const TranscriptPanel = ({ mdx }: TranscriptTab) => {
  return (
    <Navigation.Panel className="mx-3 my-4 focus:outline-none dark:text-gray-200">
      <MDXRemote {...mdx} components={mdxComponents} />
    </Navigation.Panel>
  );
};

const tabPanelRenderers = {
  "SHOW NOTES": MdxPanel,
  SECTIONS: SectionsPanel,
  TRANSCRIPT: TranscriptPanel,
} as const;

interface EpisodeClientProps {
  youtubeId: string;
  tabSections: any[];
  episodeNumberString: string;
  title: string;
  spotifyEpisodeId?: string;
  spotifyEpisodeIdAlt?: string;
}

export default function EpisodeClient({
  youtubeId,
  tabSections,
  episodeNumberString,
  title,
  spotifyEpisodeId,
  spotifyEpisodeIdAlt,
}: EpisodeClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams?.get("view");
  
  const [activeTab, setActiveTab] = useState(
    view === "youtube"
      ? tabSections.length
      : view
      ? tabSections.findIndex((t) => t.type === view.toUpperCase())
      : 0
  );

  return (
    <Page>
      <Link
        className="py-4 flex items-center space-x-2 hover:pointer"
        href="/episodes"
      >
        <ChevronLeftIcon size="medium" />
        <span className="text-lg">All episodes</span>
      </Link>

      <ColoredText className="mt-4" color="blue">
        {episodeNumberString}:
      </ColoredText>
      <h1 className="text-xl md:text-3xl mt-2 mb-8 md:mb-12">
        {title}
      </h1>

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
          const searchParams = new URLSearchParams();
          const newView =
            index === tabSections.length
              ? "youtube"
              : tabSections[index].type.toLowerCase();

          searchParams.set("view", newView);
          router.push(`${pathname}?${searchParams.toString()}`, { scroll: false });
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
                  icon={tabIcons[tabSection.type] || <DataIcon inline />}
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
          {tabSections.map((tabSection) => {
            const Panel = tabPanelRenderers[tabSection.type] || MdxPanel;
            return <Panel key={tabSection.type} {...(tabSection as any)} components={mdxComponents} />;
          })}

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