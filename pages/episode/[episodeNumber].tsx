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
import Link from "next/link";
import { useRouter } from "next/router";
import path from "path";
import fs from "fs";
import hydrate from "next-mdx-remote/hydrate";
import { useQueryParam, StringParam } from "use-query-params";
import { titleCase } from "title-case";

import { Browser } from "components/Browser";
import { Page } from "components/Page";
import { MdxRemote } from "next-mdx-remote/types";
import { ColoredText } from "components/ColoredText";
import { ProcessedMdx, processMdx } from "utils/processMdx";
import { MetaTags } from "components/MetaTags";
import { ThemedLink } from "components/ThemedLink";
import { SectionsTab, ShowNotesTab } from "utils/processMdx";
import { useState } from "react";

const mdxComponents: MdxRemote.Components = {
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

const tabIcons = {
  "SHOW NOTES": <InfoIcon inline />,
  SECTIONS: <ListIcon inline />,
  TRANSCRIPT: <ClipboardIcon inline />,
} as const;

const MdxPanel = ({ mdx }: { mdx: MdxRemote.Source }) => {
  const showNotesContent = hydrate(mdx, {
    components: mdxComponents,
  });

  return (
    <Navigation.Panel className="mx-3 my-4 focus:outline-none dark:text-gray-200">
      {showNotesContent}
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

const tabPanelRenderers = {
  "SHOW NOTES": MdxPanel,
  SECTIONS: SectionsPanel,
  TRANSCRIPT: MdxPanel,
} as const;

const Episode = ({
  youtubeId,
  spotifyEpisodeId,
  tabSections,
  frontMatter,
}: ProcessedMdx) => {
  const showNotesTab = tabSections.find(
    (tabSection) => tabSection.type === "SHOW NOTES"
  ) as ShowNotesTab;
  const router = useRouter();
  const [view, setView] = useQueryParam("view", StringParam);
  const [activeTab, activeTabSet] = useState(
    view === undefined
      ? 0
      : view === "youtube"
      ? tabSections.length
      : tabSections.findIndex((t) => t.type === view)
  );
  const { episodeNumber } = router.query;
  const episodeNumberString = `Episode #${episodeNumber}`;
  const tags = (
    <MetaTags
      title={`${episodeNumberString}: ${frontMatter.title}`}
      image={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
      description={showNotesTab.description}
    />
  );

  if (typeof window === "undefined") {
    return tags;
  }

  return (
    <Page>
      {tags}

      <Link passHref href="/episodes">
        <a className="py-4 flex items-center space-x-2 hover:pointer">
          <ChevronLeftIcon size="medium" />
          <span className="text-lg">All episodes</span>
        </a>
      </Link>

      <ColoredText className="mt-4" color="blue">
        {episodeNumberString}:
      </ColoredText>
      <h1 className="text-xl md:text-3xl mt-2 mb-8 md:mb-12">
        {frontMatter.title}
      </h1>

      <iframe
        className="mb-8 md:mb-12"
        src={`https://podcasters.spotify.com/pod/show/devtoolsfm/embed/episodes/${spotifyEpisodeId}`}
        height="161px"
        width="100%"
        frameBorder="0"
        scrolling="no"
      />
      <Browser>
        <Navigation
          index={activeTab}
          onChange={(index) => {
            const searchParams = new URLSearchParams();
            const newView =
              index === tabSections.length
                ? "youtube"
                : tabSections[index].type;

            searchParams.set("view", newView);
            const newurl =
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?" +
              searchParams.toString();

            window.history.pushState({ path: newurl }, "", newurl);
            setView(newView);
            activeTabSet(index);
          }}
        >
          <Navigation.Controls className="overflow-x-auto">
            <Navigation.TabList>
              {
                tabSections.map((tabSection) => (
                  <Navigation.Tab
                    id="about"
                    icon={tabIcons[tabSection.type] || <DataIcon inline />}
                  >
                    {titleCase(tabSection.type.toLowerCase())}
                  </Navigation.Tab>
                )) as unknown as JSX.Element
              }
              <Navigation.Tab id="youtube" icon={<ConsoleIcon inline />}>
                YouTube
              </Navigation.Tab>
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
              return <Panel {...(tabSection as any)} />;
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
};

interface EpisodeNumberParams {
  episodeNumber?: string;
}

export async function getStaticProps({
  query = {},
  params = {},
}: {
  query: EpisodeNumberParams;
  params: EpisodeNumberParams;
}) {
  const episodeNumber = query.episodeNumber || params.episodeNumber;
  const props = await processMdx(
    path.join(process.cwd(), `pages/episode/${episodeNumber}.mdx`),
    mdxComponents
  );

  return { props };
}

export async function getStaticPaths() {
  const episodes = fs
    .readdirSync(path.join(process.cwd(), `pages/episode`))
    .filter((p) => p.endsWith(".mdx"));

  return {
    fallback: false,
    paths: episodes.map((_, index) => ({
      params: { episodeNumber: String(index + 1) },
    })),
  };
}

export default Episode;
