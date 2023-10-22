import RSS from "rss";
import { promises as fs } from "fs";
import path from "path";
import { processMdx } from "utils/processMdx";

const EPISODE_REGEX = /(\d+)\.mdx/;

export async function generateRssFeed() {
  const episodes = (await fs.readdir(path.join(process.cwd(), `pages/episode`)))
    .filter((p) => p.endsWith(".mdx"))
    .sort(
      (a, b) =>
        Number(a.match(EPISODE_REGEX)[1]) - Number(b.match(EPISODE_REGEX)[1])
    )
    .reverse();

  const data = await Promise.all(
    episodes.map((episode) =>
      processMdx(path.join(process.cwd(), "pages/episode", episode), {})
    )
  );

  const site_url = "https://devtools.fm";
  const feed = new RSS({
    title: "Devtools FM RSS Feed",
    description: "An RSS feed of the episode list on the website.",
    site_url: site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/logo.png`,
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, DevtoolsFM LLC`,
  });

  data.map((episode, index) => {
    feed.item({
      title: episode.frontMatter.title,
      description: episode.description,
      url: `${site_url}/episode/${index + 1}`,
      date: episode.postCreationDate,
    });
  });

  await fs.writeFile("./public/rss.xml", feed.xml({ indent: true }));
}

generateRssFeed();
