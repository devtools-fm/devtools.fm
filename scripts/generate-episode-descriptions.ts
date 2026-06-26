import { promises as fs } from "fs";
import path from "path";

import matter from "gray-matter";

import { normalizeEpisodeDescription } from "utils/episodeDescription";
import {
  buildEpisodeDescriptionContext,
  generateEpisodeDescription,
  generateEpisodeDescriptionsWithAgentBatch,
  generateEpisodeDescriptionsWithLlmBatch,
  resolveDescriptionProvider,
} from "utils/generateEpisodeDescription";
import { loadEnvFile } from "utils/loadEnvFile";
import { processMdx } from "utils/processMdx";

loadEnvFile();

const EPISODE_DIR = path.join(process.cwd(), "pages", "episode");
const OUTPUT_FILE = path.join(
  process.cwd(),
  ".generated",
  "episode-descriptions.json"
);
const EPISODE_FILE_REGEX = /^(\d+)\.mdx$/;
const TAB_MARKER_REGEX = /^\{?\/\*\s*TAB:\s*(.+?)\s*\*\/\}?$/;

function parseArgs(argv: string[]) {
  const batchSizeArg = argv.find((arg, index) => argv[index - 1] === "--batch-size");

  return {
    apply: argv.includes("--apply"),
    dryRun: argv.includes("--dry-run") || argv.includes("-n"),
    force: argv.includes("--force") || argv.includes("-f"),
    writeMdx: !argv.includes("--json-only"),
    batchSize: batchSizeArg ? Number(batchSizeArg) : 8,
    episode:
      argv.find((arg) => /^\d+$/.test(arg)) ||
      argv.find((arg, index) => argv[index - 1] === "--episode"),
  };
}

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

function extractSectionsRaw(content: string) {
  const lines = content.split("\n");
  const sections: string[] = [];
  let inSections = false;

  for (const line of lines) {
    const tabMatch = line.match(TAB_MARKER_REGEX);

    if (tabMatch) {
      if (tabMatch[1] === "TRANSCRIPT") {
        break;
      }

      inSections = tabMatch[1] === "SECTIONS";
      continue;
    }

    if (inSections) {
      sections.push(line);
    }
  }

  return sections.join("\n");
}

async function loadEpisodeContext(file: string) {
  const absolutePath = path.join(EPISODE_DIR, file);
  const raw = await fs.readFile(absolutePath, "utf8");
  const parsed = matter(raw);
  const processed = await processMdx(absolutePath, {}, false, true);
  const showNotesTab = processed.tabSections.find((tab) => tab.type === "SHOW NOTES");

  return {
    file,
    absolutePath,
    raw,
    context: buildEpisodeDescriptionContext({
      number: file.replace(".mdx", ""),
      title: String(parsed.data.title || processed.frontMatter.title || ""),
      guests: processed.guests,
      tags: parsed.data.tags,
      showNotes:
        showNotesTab && "description" in showNotesTab
          ? showNotesTab.description
          : "",
      sectionsRaw: extractSectionsRaw(parsed.content),
    }),
    existingDescription:
      typeof parsed.data.description === "string"
        ? normalizeEpisodeDescription(parsed.data.description)
        : "",
  };
}

function chunk<T>(items: T[], size: number) {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

async function main() {
  const { apply, dryRun, force, writeMdx, batchSize, episode } = parseArgs(
    process.argv.slice(2)
  );

  if (apply) {
    const descriptions = JSON.parse(await fs.readFile(OUTPUT_FILE, "utf8")) as Record<
      string,
      string
    >;
    let updated = 0;

    for (const [number, description] of Object.entries(descriptions)) {
      const filePath = path.join(EPISODE_DIR, `${number}.mdx`);
      const raw = await fs.readFile(filePath, "utf8");
      const next = setDescription(raw, normalizeEpisodeDescription(description));

      if (next !== raw) {
        if (!dryRun) {
          await fs.writeFile(filePath, next, "utf8");
        }
        updated += 1;
      }
    }

    console.log(
      dryRun
        ? `Would apply ${updated} generated description(s) from ${path.relative(process.cwd(), OUTPUT_FILE)}`
        : `Applied ${updated} generated description(s) from ${path.relative(process.cwd(), OUTPUT_FILE)}`
    );
    return;
  }

  const files = (await fs.readdir(EPISODE_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .filter((file) => !episode || file.replace(".mdx", "") === episode)
    .sort((a, b) => Number(a.replace(".mdx", "")) - Number(b.replace(".mdx", "")));

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(await fs.readFile(OUTPUT_FILE, "utf8"));
  } catch {
    existing = {};
  }

  const pending: Awaited<ReturnType<typeof loadEpisodeContext>>[] = [];

  for (const file of files) {
    const episodeNumber = file.replace(".mdx", "");
    const loaded = await loadEpisodeContext(file);

    if (!force && existing[episodeNumber]) {
      continue;
    }

    if (!force && loaded.existingDescription && !episode) {
      existing[episodeNumber] = loaded.existingDescription;
      continue;
    }

    pending.push(loaded);
  }

  const results = { ...existing };
  let generated = 0;
  const provider = resolveDescriptionProvider();
  const useBatch =
    pending.length > 1 &&
    batchSize > 1 &&
    (provider === "agent" || provider === "anthropic");

  if (useBatch) {
    for (const batch of chunk(pending, batchSize)) {
      const batchResults =
        provider === "anthropic"
          ? await generateEpisodeDescriptionsWithLlmBatch(
              batch.map((item) => item.context)
            )
          : await generateEpisodeDescriptionsWithAgentBatch(
              batch.map((item) => item.context)
            );

      for (const item of batch) {
        const description = batchResults[item.context.number];

        if (!description) {
          throw new Error(
            `Missing generated description for episode #${item.context.number}`
          );
        }

        results[item.context.number] = description;
        generated += 1;
        console.log(`#${item.context.number}: ${description}`);

        if (!dryRun && writeMdx) {
          await fs.writeFile(
            item.absolutePath,
            setDescription(item.raw, description),
            "utf8"
          );
        }
      }
    }
  } else {
    for (const item of pending) {
      const description = await generateEpisodeDescription(item.context);
      results[item.context.number] = description;
      generated += 1;
      console.log(`#${item.context.number}: ${description}`);

      if (!dryRun && writeMdx) {
        await fs.writeFile(
          item.absolutePath,
          setDescription(item.raw, description),
          "utf8"
        );
      }
    }
  }

  if (!dryRun) {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");
  }

  console.log(
    dryRun
      ? `Dry run complete: ${generated} generated via ${provider}${useBatch ? ` (batch size ${batchSize})` : ""}`
      : `Generated ${generated} description(s) via ${provider}${useBatch ? ` (batch size ${batchSize})` : ""}. Saved ${path.relative(process.cwd(), OUTPUT_FILE)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
