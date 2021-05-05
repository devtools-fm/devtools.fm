import {
  ClipboardIcon,
  ConsoleIcon,
  InfoIcon,
  ListIcon,
  MoreInfoIcon,
  NewWindowIcon,
} from "@devtools-ds/icon";
import { Navigation } from "@devtools-ds/navigation";
import { useRouter } from "next/router";
import path from "path";
import fs from "fs";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";
import matter from "gray-matter";

import { Browser } from "components/Browser";
import { Page } from "components/Page";
import { MdxRemote } from "next-mdx-remote/types";
import { ColoredText } from "components/ColoredText";

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

interface EpisodeProps {
  showNotes: MdxRemote.Source;
  sections: MdxRemote.Source;
  transcript: MdxRemote.Source;
  frontmatter: {
    title: string;
    youtube: string;
    buzzsprout: string;
  };
}

const Episode = ({
  showNotes,
  sections,
  transcript,
  frontmatter,
}: EpisodeProps) => {
  const router = useRouter();
  const { episodeNumber } = router.query;
  const pageTitle = `Episode #${episodeNumber}`;
  const showNotesContent = hydrate(showNotes, { components: mdxComponents });
  const sectionsContent = hydrate(sections, { components: mdxComponents });
  const transcriptContent = hydrate(transcript, { components: mdxComponents });

  return (
    <Page title={pageTitle}>
      <h1 className="text-3xl mt-8 mb-12">
        {pageTitle}: {frontmatter.title}
      </h1>

      <Browser>
        <Navigation>
          <Navigation.Controls>
            <Navigation.TabList>
              <Navigation.Tab id="about" icon={<InfoIcon inline />}>
                Show Notes
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<ListIcon inline />}>
                Sections
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<ConsoleIcon inline />}>
                YouTube
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<ClipboardIcon inline />}>
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
            <Navigation.Panel className="mx-3 mb-4">
              {showNotesContent}
            </Navigation.Panel>
            <Navigation.Panel className="mx-3 mb-4">
              {sectionsContent}
            </Navigation.Panel>
            <Navigation.Panel className="mx-3 mb-4">
              <div className="relative pb-[56.25%]">
                <iframe
                  allowFullScreen
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/xkiw379QRU4"
                  title="YouTube video player"
                  frameBorder="0"
                  className="absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </Navigation.Panel>
            <Navigation.Panel className="mx-3 mb-4">
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
  const { data, content } = matter.read(
    path.join(process.cwd(), `pages/episode/${episodeNumber}.mdx`)
  );

  const [showNotesMdx, rest] = content.split("<!-- SECTIONS -->");
  const [sectionsMdx, transcriptMdx] = rest.split("<!-- Transcript -->");
  const showNotes = await renderToString(showNotesMdx, {
    components: mdxComponents,
  });
  const sections = await renderToString(sectionsMdx, {
    components: mdxComponents,
  });
  const transcript = await renderToString(transcriptMdx, {
    components: mdxComponents,
  });

  return { props: { showNotes, sections, transcript, frontmatter: data } };
}

export async function getStaticPaths() {
  const episodes = fs
    .readdirSync(path.join(process.cwd(), `pages/episode`))
    .filter((p) => p.endsWith(".mdx"));

  return {
    fallback: true,
    paths: episodes.map((_, index) => ({
      params: { episodeNumber: String(index + 1) },
    })),
  };
}

export default Episode;
