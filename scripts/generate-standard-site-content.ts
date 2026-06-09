import { promises as fs } from "fs";
import path from "path";

import matter from "gray-matter";

import { processMdx } from "utils/processMdx";
import { SEQUOIA_CONTENT_DIR } from "utils/sequoia";

const EPISODE_FILE_REGEX = /^(\d+)\.mdx$/;
const TAB_MARKER_REGEX = /^\{?\/\*\s*TAB:\s*(.+?)\s*\*\/\}?$/;
const LINKS_MARKER_REGEX = /^\{?\/\*\s*LINKS\s*\*\/\}?$/;

function toPublishDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Unable to parse publish date: ${value}`);
  }

  return date.toISOString().slice(0, 10);
}

function toTags(tags?: string | string[]) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function compactMarkdown(markdown: string) {
  return markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function buildDocumentBody(content: string) {
  const lines = content.split("\n");
  const showNotes: string[] = [];
  const sections: string[] = [];
  let currentSection: "SHOW NOTES" | "SECTIONS" | null = null;

  for (const line of lines) {
    const tabMatch = line.match(TAB_MARKER_REGEX);

    if (tabMatch) {
      const tabName = tabMatch[1];

      if (tabName === "TRANSCRIPT") {
        break;
      }

      if (tabName === "SHOW NOTES" || tabName === "SECTIONS") {
        currentSection = tabName;
      } else {
        currentSection = null;
      }

      continue;
    }

    if (line.match(LINKS_MARKER_REGEX)) {
      continue;
    }

    if (currentSection === "SHOW NOTES") {
      showNotes.push(line);
    }

    if (currentSection === "SECTIONS") {
      sections.push(line);
    }
  }

  const showNotesMarkdown = compactMarkdown(showNotes.join("\n"));
  const sectionsMarkdown = compactMarkdown(sections.join("\n"));

  if (!sectionsMarkdown) {
    return showNotesMarkdown;
  }

  return compactMarkdown(
    `${showNotesMarkdown}\n\n## Sections\n\n${sectionsMarkdown}`
  );
}

async function main() {
  const sourceDir = path.join(process.cwd(), "pages", "episode");
  const files = await fs.readdir(sourceDir);

  await fs.mkdir(SEQUOIA_CONTENT_DIR, { recursive: true });

  for (const file of files.sort((a, b) => {
    const aNumber = Number(a.match(EPISODE_FILE_REGEX)?.[1] || "0");
    const bNumber = Number(b.match(EPISODE_FILE_REGEX)?.[1] || "0");
    return aNumber - bNumber;
  })) {
    const match = file.match(EPISODE_FILE_REGEX);
    if (!match) continue;

    const sourcePath = path.join(sourceDir, file);
    const raw = await fs.readFile(sourcePath, "utf8");
    const parsed = matter(raw);
    const processed = await processMdx(sourcePath, {}, true, true);
    const body = buildDocumentBody(parsed.content) || processed.description;
    const generatedPath = path.join(SEQUOIA_CONTENT_DIR, `${match[1]}.md`);
    let existingAtUri: string | undefined;
    try {
      const existingGenerated = matter(await fs.readFile(generatedPath, "utf8"));
      if (typeof existingGenerated.data.atUri === "string") {
        existingAtUri = existingGenerated.data.atUri;
      }
    } catch {
      existingAtUri = undefined;
    }

    const output = matter.stringify(body, {
      title: processed.frontMatter.title,
      description: processed.description,
      publishDate: toPublishDate(
        processed.frontMatter.publishDate ||
          processed.frontMatter.date ||
          processed.postCreationDate
      ),
      tags: toTags(processed.frontMatter.tags),
      ...(existingAtUri ? { atUri: existingAtUri } : {}),
    });

    await fs.writeFile(generatedPath, output, "utf8");
  }

  console.log(
    `Generated Sequoia content in ${path.relative(
      process.cwd(),
      SEQUOIA_CONTENT_DIR
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
