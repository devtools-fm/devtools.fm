import fs from "node:fs";
import path from "node:path";

import type { APIRoute } from "astro";

import { createEpisodeOgImage } from "utils/ogImage";
import { processMdx, type ProcessedMdx } from "utils/processMdx";

interface Props {
  episode: ProcessedMdx;
}

export const prerender = true;

export async function getStaticPaths() {
  const episodeFiles = fs
    .readdirSync(path.join(process.cwd(), "pages/episode"))
    .filter((file) => file.endsWith(".mdx"));

  return Promise.all(
    episodeFiles.map(async (file) => {
      const episodeNumber = path.basename(file, ".mdx");
      const episode = await processMdx(
        path.join(process.cwd(), "pages/episode", file),
        false,
        true
      );

      return {
        params: { episodeNumber },
        props: { episode },
      };
    })
  );
}

export const GET: APIRoute = ({ params, props }) =>
  createEpisodeOgImage(params.episodeNumber!, (props as Props).episode);
