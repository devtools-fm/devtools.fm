import { promises as fs } from "fs";
import path from "path";

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");
const EPISODE_FILE_REGEX = /^\d+\.mdx$/;

const MALFORMED_FRONTMATTER_REGEX =
  /^(spotify:\s*)(\S*?)atUri:\s*"([^"]+)"\n---([^\n]+)$/m;

function repairMalformedFrontmatter(raw: string) {
  return raw.replace(
    MALFORMED_FRONTMATTER_REGEX,
    (
      _match,
      spotifyPrefix: string,
      spotifyStart: string,
      atUri: string,
      spotifyEnd: string
    ) => `${spotifyPrefix}${spotifyStart}---${spotifyEnd}\natUri: "${atUri}"`
  );
}

function slugifySpotifyPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSpotifySlugFromTitle(raw: string) {
  const title = raw.match(/^title:\s*(.+)$/m)?.[1]?.trim();
  const spotifyUrl = raw.match(/^spotify:\s*(.+)$/m)?.[1]?.trim();

  if (!title || !spotifyUrl) {
    return raw;
  }

  if (!spotifyUrl.includes("/episodes/") || spotifyUrl.includes("open.spotify.com/episode/")) {
    return raw;
  }

  const titleParts = title.split(" - ");
  if (titleParts.length < 2) {
    return raw;
  }

  const topicSlug = slugifySpotifyPart(titleParts.slice(1).join(" - "));
  if (!topicSlug || spotifyUrl.includes(`---${topicSlug}`)) {
    return raw;
  }

  const topicIndex = spotifyUrl.lastIndexOf(topicSlug);
  if (topicIndex === -1) {
    return raw;
  }

  const updatedSpotifyUrl = `${spotifyUrl.slice(0, topicIndex)}---${spotifyUrl.slice(topicIndex)}`;
  return raw.replace(/^spotify:\s*.+$/m, `spotify: ${updatedSpotifyUrl}`);
}

async function main() {
  const files = (await fs.readdir(EPISODE_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .sort((a, b) => Number(a.replace(".mdx", "")) - Number(b.replace(".mdx", "")));

  let updated = 0;

  for (const file of files) {
    const absolutePath = path.join(EPISODE_DIR, file);
    const raw = await fs.readFile(absolutePath, "utf8");

    if (
      !MALFORMED_FRONTMATTER_REGEX.test(raw) &&
      normalizeSpotifySlugFromTitle(raw) === raw
    ) {
      continue;
    }

    const next = normalizeSpotifySlugFromTitle(repairMalformedFrontmatter(raw));

    if (next !== raw) {
      await fs.writeFile(absolutePath, next, "utf8");
      updated += 1;
    }
  }

  console.log(`Repaired malformed Spotify/atUri frontmatter in ${updated} episode file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
