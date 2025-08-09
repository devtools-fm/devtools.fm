"use client";

import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { ProcessedMdx } from "utils/processMdx";
import { NavigationTopBar } from "components/NavigationTopBar";
import { EpisodeRow } from "components/EpisodeRow";
import { LinkShieldList } from "components/LinkShieldList";

interface EpisodesClientProps {
  episodes: ProcessedMdx[];
}

export default function EpisodesClient({ episodes }: EpisodesClientProps) {
  return (
    <Page>
      <div className="mt-10 mb-12">
        <h1 className="flex justify-center mb-10">
          <Logo />
        </h1>

        <p className="text-lg text-center mb-8">
          A podcast about{" "}
          <ColoredText color="purple">developer tools</ColoredText> and the{" "}
          <ColoredText color="blue">people</ColoredText> who make them.
        </p>

        <LinkShieldList limit={6} />
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