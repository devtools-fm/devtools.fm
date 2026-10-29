import { promises as fs } from "fs";
import path from "path";
import { processMdx } from "./processMdx";

export async function getLatestEp() {
  const episodes = (await fs.readdir(path.join(process.cwd(), `pages/episode`)))
    .filter((p) => p.endsWith(".mdx"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const latestEpisodeNumber = episodes[episodes.length - 1];

  // Only the episode-row fields are used, so skip the rendered tab sections
  // (including the full transcript) to keep them out of the island props.
  return await processMdx(
    path.join(process.cwd(), "pages/episode", latestEpisodeNumber),
    false,
    false
  );
}
