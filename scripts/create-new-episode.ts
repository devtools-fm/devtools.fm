import path from "path";
import endent from "endent";
import { promises as fs } from "fs";

const episodeDirectory = path.join(__dirname, "../pages/episodes");

const createNewEpisode = async () => {
  const currentEpisodeCount = (await fs.readdir(episodeDirectory)).length;
  const episodeNumber = currentEpisodeCount + 1;
  const template = await fs.readFile(
    path.join(__dirname, "new-episode-tempate.md"),
    "utf-8"
  );

  const content = endent`
    # Episode ${episodeNumber}

    ${template}
  `;

  await fs.writeFile(
    path.join(episodeDirectory, `episode-${episodeNumber}.md`),
    content
  );
};

createNewEpisode();
