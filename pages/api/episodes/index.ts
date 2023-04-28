import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { processMdx } from "utils/processMdx";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const episodes = fs
    .readdirSync(path.join(process.cwd(), `pages/episode`))
    .filter((p) => p.endsWith(".mdx"));

  const data = await Promise.all(
    episodes.map((episode) =>
      processMdx(path.join(process.cwd(), "pages/episode", episode), {})
    )
  );

  res
    .status(200)
    .json(data.sort((a, b) => parseInt(b.number) - parseInt(a.number)));
}
