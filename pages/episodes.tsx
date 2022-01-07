import { promises as fs } from "fs";
import path from "path";
import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { ProcessedMdx, processMdx } from "utils/processMdx";
import { MetaTags } from "components/MetaTags";
import { NavigationTopBar } from "components/NavigationTopBar";
import { EpisodeRow } from "components/EpisodeRow";

interface EpisodesProps {
  episodes: ProcessedMdx[];
}

export default function Episodes({ episodes }: EpisodesProps) {
  const tags = (
    <MetaTags
      title="devtools.fm - Episodes"
      description="A list of the the episodes."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (typeof window === "undefined") {
    return tags;
  }

  return (
    <Page>
      {tags}

      <div className="mt-10 mb-12">
        <h1 className="flex justify-center mb-10">
          <Logo />
        </h1>

        <p className="text-lg text-center">
          A podcast about{" "}
          <ColoredText color="purple">developer tools</ColoredText> and the{" "}
          <ColoredText color="blue">people</ColoredText> who make them.
        </p>
      </div>

      <Browser>
        <Navigation index={1} onChange={() => {}}>
          <NavigationTopBar />
          <Navigation.Panels>
            <Navigation.Panel />
            <Navigation.Panel className="md:p-4 pt-4 mx-3 mb-4 focus:outline-none">
              <div className="divide-y-2 divide-gray-300 dark:divide-gray-600">
                {episodes.map((episode) => (
                  <EpisodeRow key={episode.frontMatter.title} {...episode} />
                ))}
              </div>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}

export async function getStaticProps() {
  const episodes = (
    await fs.readdir(path.join(process.cwd(), `pages/episode`))
  ).filter((p) => p.endsWith(".mdx"));

  const data = await Promise.all(
    episodes.map((episode) =>
      processMdx(path.join(process.cwd(), "pages/episode", episode), {})
    )
  );

  return {
    props: {
      episodes: data.sort((a, b) => Number(b.number) - Number(a.number)),
    },
  };
}
