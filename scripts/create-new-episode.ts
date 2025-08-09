import path from "path";
import { promises as fs } from "fs";

const episodeDirectory = path.join(__dirname, "../pages/episode");

const createNewEpisode = async () => {
  const currentEpisodeCount = (await fs.readdir(episodeDirectory)).length;
  const episodeNumber = currentEpisodeCount;
  const template = await fs.readFile(
    path.join(__dirname, "new-episode-tempate.mdx"),
    "utf-8"
  );

  await fs.writeFile(
    path.join(episodeDirectory, `${episodeNumber}.mdx`),
    template
  );
};

createNewEpisode();
