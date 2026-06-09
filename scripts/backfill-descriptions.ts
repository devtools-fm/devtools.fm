import { promises as fs } from "fs";
import path from "path";

import { processMdx } from "utils/processMdx";

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");
const EPISODE_FILE_REGEX = /^\d+\.mdx$/;

function toYamlString(value: string) {
  return JSON.stringify(value);
}

function normalizeDescription(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function addDescription(raw: string, description: string) {
  const yamlDescription = toYamlString(description);

  if (/^description:\s*/m.test(raw)) {
    return raw.replace(/^description:\s*.*$/m, `description: ${yamlDescription}`);
  }

  if (/^title:\s*/m.test(raw)) {
    return raw.replace(/^title:\s*.*$/m, (line) => `${line}\ndescription: ${yamlDescription}`);
  }

  return raw.replace(/^---\n/, `---\ndescription: ${yamlDescription}\n`);
}

async function main() {
  const files = (await fs.readdir(EPISODE_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .sort((a, b) => Number(a.replace(".mdx", "")) - Number(b.replace(".mdx", "")));

  let updated = 0;

  for (const file of files) {
    const absolutePath = path.join(EPISODE_DIR, file);
    const raw = await fs.readFile(absolutePath, "utf8");
    const existingDescription = raw.match(/^description:\s*(.+)$/m)?.[1]?.trim();

    if (existingDescription) {
      continue;
    }

    const processed = await processMdx(absolutePath, {}, true, false);
    const description = normalizeDescription(processed.description);

    if (!description) {
      continue;
    }

    const next = addDescription(raw, description);

    if (next !== raw) {
      await fs.writeFile(absolutePath, next, "utf8");
      updated += 1;
    }
  }

  console.log(`Updated description in ${updated} episode file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
