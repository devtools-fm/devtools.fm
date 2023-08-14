import { promises as fs } from "fs";
import path from "path";
import { processMdx } from "./processMdx";

export async function getLatestEp() {
  const episodes = (await fs.readdir(path.join(process.cwd(), `pages/episode`)))
    .filter((p) => p.endsWith(".mdx"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const latestEpisodeNumber = episodes[episodes.length - 1];

  return await processMdx(
    path.join(process.cwd(), "pages/episode", latestEpisodeNumber),
    {}
  );
}
