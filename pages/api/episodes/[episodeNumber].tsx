import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { processMdx } from "utils/processMdx";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { episodeNumber } = req.query;

  if (typeof episodeNumber !== "string" || !episodeNumber.match(/^\d+$/)) {
    res.status(400).json({ error: "Invalid episode number" });
    return;
  }
  const episode = parseInt(episodeNumber);

  const episodes = fs
    .readdirSync(path.join(process.cwd(), `pages/episode`))
    .filter((p) => p.endsWith(".mdx"));

  if (episode < 1 || episode > episodes.length - 1) {
    res.status(400).json({ error: "Episode number out of range" });
    return;
  }

  const data = await processMdx(
    path.join(process.cwd(), `pages/episode/${episode}.mdx`),
    {}
  );
  delete data.tabSections;
  console.log(data);

  res.status(200).json(data);
}
