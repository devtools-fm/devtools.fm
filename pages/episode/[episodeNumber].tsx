import {
  ChevronLeftIcon,
  ClipboardIcon,
  ConsoleIcon,
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

import { Browser } from "components/Browser";
import { Page } from "components/Page";
import { MdxRemote } from "next-mdx-remote/types";
import { ColoredText } from "components/ColoredText";
import { ProcessedMdx, processMdx } from "utils/processMdx";
import { MetaTags } from "components/MetaTags";

const mdxComponents: MdxRemote.Components = {
  a: (props) => <a {...props} className="text-blue-500 underline" />,
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

const Episode = ({
  youtubeId,
  buzzSproutEpisodeId,
  description,
  showNotes,
  sections,
  transcript,
  frontMatter,
}: ProcessedMdx) => {
  const router = useRouter();
  const [view, setView] = useQueryParam("view", StringParam);
  const { episodeNumber } = router.query;
  const tabOrder = ["about", "episodes", "youtube", "transcript"];
  const activeTab = view || tabOrder[0];
  const episodeNumberString = `Episode #${episodeNumber}`;
  const tags = (
    <MetaTags
      title={`${episodeNumberString}: ${frontMatter.title}`}
      image={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
      description={description}
    />
  );

  if (typeof window === "undefined") {
    return tags;
  }

  const showNotesContent = hydrate(showNotes, { components: mdxComponents });
  const sectionsContent = hydrate(sections, { components: mdxComponents });
  const transcriptContent = hydrate(transcript, { components: mdxComponents });

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
        src={`https://www.buzzsprout.com/1772992/${buzzSproutEpisodeId}?client_source=admin&amp;iframe=true`}
        width="100%"
        height="200"
        frameBorder="0"
        scrolling="no"
      />
      <Browser>
        <Navigation
          index={tabOrder.indexOf(activeTab)}
          onChange={(index) => {
            const searchParams = new URLSearchParams();
            searchParams.set("view", tabOrder[index]);
            const newurl =
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?" +
              searchParams.toString();

            window.history.pushState({ path: newurl }, "", newurl);
            setView(tabOrder[index]);
          }}
        >
          <Navigation.Controls className="overflow-x-auto">
            <Navigation.TabList>
              <Navigation.Tab id="about" icon={<InfoIcon inline />}>
                Show Notes
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<ListIcon inline />}>
                Sections
              </Navigation.Tab>
              <Navigation.Tab id="youtube" icon={<ConsoleIcon inline />}>
                YouTube
              </Navigation.Tab>
              <Navigation.Tab id="transcript" icon={<ClipboardIcon inline />}>
                Transcript
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
            <Navigation.Panel className="mx-3 mb-4 focus:outline-none">
              {showNotesContent}
            </Navigation.Panel>
            <Navigation.Panel className="mx-3 mb-4 focus:outline-none">
              {sectionsContent}
            </Navigation.Panel>
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
            <Navigation.Panel className="mx-3 mb-4 focus:outline-none">
              {transcriptContent}
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
