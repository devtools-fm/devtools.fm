import { execFileSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");

function getChangedEpisodeFiles() {
  const output = execFileSync("git", ["diff", "--name-only", "--", "pages/episode"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => file.endsWith(".mdx"));
}

function getHeadFileContent(relativePath: string) {
  return execFileSync("git", ["show", `HEAD:${relativePath}`], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function getSpotifyLine(content: string) {
  return content.match(/^spotify:\s*.*$/m)?.[0] ?? null;
}

async function main() {
  const files = getChangedEpisodeFiles();
  let updated = 0;

  for (const relativePath of files) {
    const absolutePath = path.join(process.cwd(), relativePath);
    const current = await fs.readFile(absolutePath, "utf8");
    const head = getHeadFileContent(relativePath);

    const currentSpotify = getSpotifyLine(current);
    const headSpotify = getSpotifyLine(head);

    if (!currentSpotify || !headSpotify || currentSpotify === headSpotify) {
      continue;
    }

    const next = current.replace(/^spotify:\s*.*$/m, headSpotify);

    if (next !== current) {
      await fs.writeFile(absolutePath, next, "utf8");
      updated += 1;
    }
  }

  console.log(`Reverted spotify lines in ${updated} episode file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
