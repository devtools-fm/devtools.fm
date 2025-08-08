import {
  ChevronLeftIcon,
} from "@devtools-ds/icon";
import Link from "next/link";
import path from "path";
import fs from "fs";
import { Metadata } from "next";

import { ProcessedMdx, processMdx } from "utils/processMdx";
import { SectionsTab, ShowNotesTab } from "utils/processMdx";
import EpisodeClient from "./episode-client";

interface EpisodeParams {
  episodeNumber: string;
}

export async function generateMetadata({
  params,
}: {
  params: EpisodeParams;
}): Promise<Metadata> {
  const { episodeNumber } = params;
  const processedMdx = await processMdx(
    path.join(process.cwd(), `pages/episode/${episodeNumber}.mdx`),
    {},
    false,
    false
  );

  const {
    youtubeId,
    thumbnailId,
    frontMatter,
    tabSections,
  } = processedMdx;

  const showNotesTab = tabSections.find(
    (tabSection) => tabSection.type === "SHOW NOTES"
  ) as ShowNotesTab;

  const episodeNumberString = `Episode #${episodeNumber}`;
  const title = `${episodeNumberString}: ${frontMatter.title}`;
  const description = showNotesTab?.description || "";
  const image = `https://i.ytimg.com/vi/${thumbnailId || youtubeId}/maxresdefault.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      url: `https://devtools.fm/episode/${episodeNumber}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Episode({
  params,
}: {
  params: EpisodeParams;
}) {
  const { episodeNumber } = params;
  const processedMdx = await processMdx(
    path.join(process.cwd(), `pages/episode/${episodeNumber}.mdx`),
    {},
    false,
    false
  );

  const {
    youtubeId,
    thumbnailId,
    spotifyEpisodeId,
    spotifyEpisodeIdAlt,
    tabSections,
    frontMatter,
  } = processedMdx;

  const showNotesTab = tabSections.find(
    (tabSection) => tabSection.type === "SHOW NOTES"
  ) as ShowNotesTab;

  const episodeNumberString = `Episode #${episodeNumber}`;

  return (
    <EpisodeClient
      youtubeId={youtubeId}
      tabSections={tabSections}
      episodeNumberString={episodeNumberString}
      title={frontMatter.title}
      spotifyEpisodeId={spotifyEpisodeId}
      spotifyEpisodeIdAlt={spotifyEpisodeIdAlt}
    />
  );
}

export async function generateStaticParams() {
  const episodes = fs
    .readdirSync(path.join(process.cwd(), `pages/episode`))
    .filter((p) => p.endsWith(".mdx"));

  return episodes.map((_, index) => ({
    episodeNumber: String(index + 1),
  }));
}