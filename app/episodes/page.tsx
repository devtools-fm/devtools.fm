import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";

import { ProcessedMdx, processMdx } from "utils/processMdx";
import EpisodesClient from "./episodes-client";

export const metadata: Metadata = {
  title: "devtools.fm - Episodes",
  description: "A list of the the episodes.",
  openGraph: {
    title: "devtools.fm - Episodes",
    description: "A list of the the episodes.",
    images: ["https://devtools.fm/og-image.png"],
    url: "https://devtools.fm/episodes",
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Episodes",
    description: "A list of the the episodes.",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default async function Episodes() {
  const episodes = (
    await fs.readdir(path.join(process.cwd(), `pages/episode`))
  ).filter((p) => p.endsWith(".mdx"));

  const data = await Promise.all(
    episodes.map((episode) =>
      processMdx(
        path.join(process.cwd(), "pages/episode", episode),
        {},
        false,
        false
      )
    )
  );

  const sortedEpisodes = data.sort((a, b) => Number(b.number) - Number(a.number));

  return <EpisodesClient episodes={sortedEpisodes} />;
}