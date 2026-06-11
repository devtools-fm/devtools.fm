import { promises as fs } from "fs";
import path from "path";

import { normalizeEpisodeDescription } from "utils/episodeDescription";
import { processMdx } from "utils/processMdx";

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");
const EPISODE_FILE_REGEX = /^\d+\.mdx$/;

function toYamlString(value: string) {
  return JSON.stringify(value);
}

function setDescription(raw: string, description: string) {
  const yamlDescription = toYamlString(description);

  if (/^description:\s*/m.test(raw)) {
    return raw.replace(/^description:\s*.*$/m, `description: ${yamlDescription}`);
  }

  if (/^title:\s*/m.test(raw)) {
    return raw.replace(/^title:\s*.*$/m, (line) => `${line}\ndescription: ${yamlDescription}`);
  }

  return raw.replace(/^---\n/, `---\ndescription: ${yamlDescription}\n`);
}

function parseExistingDescription(raw: string) {
  const match = raw.match(/^description:\s*(.+)$/m)?.[1]?.trim();

  if (!match) {
    return "";
  }

  if (match.startsWith('"') || match.startsWith("'")) {
    try {
      return normalizeEpisodeDescription(JSON.parse(match));
    } catch {
      return normalizeEpisodeDescription(match.slice(1, -1));
    }
  }

  return normalizeEpisodeDescription(match);
}

async function main() {
  const files = (await fs.readdir(EPISODE_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .sort((a, b) => Number(a.replace(".mdx", "")) - Number(b.replace(".mdx", "")));

  let updated = 0;
  let unchanged = 0;

  for (const file of files) {
    const absolutePath = path.join(EPISODE_DIR, file);
    const raw = await fs.readFile(absolutePath, "utf8");
    const existingDescription = parseExistingDescription(raw);
    const processed = await processMdx(absolutePath, {}, false, true);
    const description = normalizeEpisodeDescription(processed.description);

    if (!description) {
      continue;
    }

    const normalizedExisting = existingDescription;

    if (normalizedExisting === description) {
      unchanged += 1;
      continue;
    }

    const next = setDescription(raw, description);

    if (next !== raw) {
      await fs.writeFile(absolutePath, next, "utf8");
      updated += 1;
    }
  }

  console.log(
    `Updated description in ${updated} episode file(s). ${unchanged} already matched.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
