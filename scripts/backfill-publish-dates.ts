import { promises as fs } from "fs";
import path from "path";
import { execFileSync } from "child_process";

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");
const EPISODE_FILE_REGEX = /^\d+\.mdx$/;

function getGitPublishDate(relativePath: string) {
  const firstOutput = execFileSync(
    "git",
    ["log", "--diff-filter=A", "--follow", "--format=%aI", "--reverse", "--", relativePath],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    }
  ).trim();

  const firstLine = firstOutput.split("\n").find(Boolean);

  if (firstLine) {
    return firstLine.slice(0, 10);
  }

  const fallbackOutput = execFileSync(
    "git",
    ["log", "--format=%aI", "--", relativePath],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    }
  ).trim();
  const fallbackLine = fallbackOutput.split("\n").filter(Boolean).at(-1);

  if (!fallbackLine) {
    throw new Error(`Could not determine git creation date for ${relativePath}`);
  }

  return fallbackLine.slice(0, 10);
}

function addPublishDate(raw: string, publishDate: string) {
  if (/^publishDate:\s*/m.test(raw)) {
    return raw.replace(/^publishDate:\s*.*$/m, `publishDate: ${publishDate}`);
  }

  if (/^date:\s*/m.test(raw)) {
    return raw.replace(/^date:\s*.*$/m, (line) => `${line}\npublishDate: ${publishDate}`);
  }

  if (/^spotify:\s*/m.test(raw)) {
    return raw.replace(
      /^spotify:\s*.*$/m,
      (line) => `${line}\npublishDate: ${publishDate}`
    );
  }

  return raw.replace(/^---\n([\s\S]*?)\n---/, `---\n$1\npublishDate: ${publishDate}\n---`);
}

async function main() {
  const files = (await fs.readdir(EPISODE_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .sort((a, b) => Number(a.replace(".mdx", "")) - Number(b.replace(".mdx", "")));

  let updated = 0;

  for (const file of files) {
    const absolutePath = path.join(EPISODE_DIR, file);
    const relativePath = path.relative(process.cwd(), absolutePath);
    const raw = await fs.readFile(absolutePath, "utf8");
    const existingPublishDate = raw.match(/^publishDate:\s*(.+)$/m)?.[1]?.trim();
    const existingDate = raw.match(/^date:\s*(.+)$/m)?.[1]?.trim();
    const publishDate = existingPublishDate || existingDate || getGitPublishDate(relativePath);
    const next = addPublishDate(raw, publishDate);

    if (next !== raw) {
      await fs.writeFile(absolutePath, next, "utf8");
      updated += 1;
    }
  }

  console.log(`Updated publishDate in ${updated} episode file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
