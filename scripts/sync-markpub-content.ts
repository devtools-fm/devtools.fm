import { createHash } from "crypto";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

import matter from "gray-matter";

import { createAuthenticatedAgent } from "utils/atproto-auth";
import { loadEnvFile } from "utils/loadEnvFile";
import { buildMarkpubFrontMatter, buildMarkpubMarkdown } from "utils/markpub";
import { SEQUOIA_CONFIG_FILE, SEQUOIA_CONTENT_DIR } from "utils/sequoia";

loadEnvFile();

const MARKPUB_STATE_FILE = path.join(process.cwd(), ".markpub-state.json");
const SEQUOIA_STATE_FILE = path.join(process.cwd(), ".sequoia-state.json");
const EPISODE_FILE_REGEX = /^(\d+)\.md$/;

type MarkpubState = {
  posts: Record<
    string,
    {
      atUri: string;
      contentHash: string;
      description?: string;
    }
  >;
};

type SequoiaState = {
  posts?: Record<
    string,
    {
      atUri?: string;
    }
  >;
};

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run") || argv.includes("-n"),
    force: argv.includes("--force") || argv.includes("-f"),
    verbose: argv.includes("--verbose") || argv.includes("-v"),
    episode:
      argv.find((arg) => /^\d+$/.test(arg)) ||
      argv.find((arg, index) => argv[index - 1] === "--episode"),
  };
}

function hashSyncPayload(payload: { content: unknown; description?: string }) {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function parseAtUri(atUri: string) {
  const match = atUri.match(/^at:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid atUri format: ${atUri}`);
  }

  return {
    repo: match[1],
    collection: match[2],
    rkey: match[3],
  };
}

async function loadMarkpubState(): Promise<MarkpubState> {
  try {
    return JSON.parse(await fsPromises.readFile(MARKPUB_STATE_FILE, "utf8"));
  } catch {
    return { posts: {} };
  }
}

async function saveMarkpubState(state: MarkpubState) {
  await fsPromises.writeFile(
    MARKPUB_STATE_FILE,
    JSON.stringify(state, null, 2),
    "utf8"
  );
}

async function loadSequoiaState(): Promise<SequoiaState> {
  try {
    return JSON.parse(await fsPromises.readFile(SEQUOIA_STATE_FILE, "utf8"));
  } catch {
    return { posts: {} };
  }
}

function resolveAtUri(
  relativePath: string,
  frontmatter: Record<string, unknown>,
  sequoiaState: SequoiaState
) {
  if (typeof frontmatter.atUri === "string" && frontmatter.atUri.length > 0) {
    return frontmatter.atUri;
  }

  return sequoiaState.posts?.[relativePath]?.atUri;
}

function toTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags.map(String).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

async function main() {
  const { dryRun, force, verbose, episode } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(SEQUOIA_CONFIG_FILE)) {
    throw new Error("No sequoia.json found. Run `pnpm exec sequoia init` first.");
  }

  const files = (await fsPromises.readdir(SEQUOIA_CONTENT_DIR))
    .filter((file) => EPISODE_FILE_REGEX.test(file))
    .filter((file) => !episode || file.replace(".md", "") === episode);

  if (files.length === 0) {
    console.log(
      `No generated content found in ${path.relative(process.cwd(), SEQUOIA_CONTENT_DIR)}. Run pnpm standard-site:prepare-content first.`
    );
    return;
  }

  const [markpubState, sequoiaState] = await Promise.all([
    loadMarkpubState(),
    loadSequoiaState(),
  ]);

  const agent = dryRun ? null : await createAuthenticatedAgent();
  let updatedCount = 0;
  let skippedCount = 0;
  let pendingCount = 0;

  for (const file of files.sort((a, b) => {
    const aNumber = Number(a.match(EPISODE_FILE_REGEX)?.[1] || "0");
    const bNumber = Number(b.match(EPISODE_FILE_REGEX)?.[1] || "0");
    return aNumber - bNumber;
  })) {
    const filePath = path.join(SEQUOIA_CONTENT_DIR, file);
    const relativePath = path.relative(process.cwd(), filePath);
    const parsed = matter(await fsPromises.readFile(filePath, "utf8"));
    const atUri = resolveAtUri(relativePath, parsed.data, sequoiaState);

    if (!atUri) {
      pendingCount += 1;
      if (verbose) {
        console.log(`Skipping ${file}: no atUri yet (publish with sequoia first)`);
      }
      continue;
    }

    const description =
      typeof parsed.data.description === "string"
        ? parsed.data.description.trim()
        : undefined;

    const markpubContent = buildMarkpubMarkdown({
      markdown: parsed.content.trim(),
      frontMatter: buildMarkpubFrontMatter({
        title:
          typeof parsed.data.title === "string" ? parsed.data.title : undefined,
        description,
        publishDate:
          typeof parsed.data.publishDate === "string"
            ? parsed.data.publishDate
            : undefined,
        tags: toTags(parsed.data.tags),
      }),
    });

    const syncHash = hashSyncPayload({
      content: markpubContent,
      description,
    });
    const previous = markpubState.posts[relativePath];

    if (
      !force &&
      previous?.contentHash === syncHash &&
      previous.atUri === atUri &&
      previous.description === description
    ) {
      skippedCount += 1;
      continue;
    }

    if (dryRun) {
      console.log(
        `Would update ${file} (${atUri}) with description and at.markpub.markdown content`
      );
      updatedCount += 1;
      continue;
    }

    const { repo, collection, rkey } = parseAtUri(atUri);
    const existing = await agent!.com.atproto.repo.getRecord({
      repo,
      collection,
      rkey,
    });

    await agent!.com.atproto.repo.putRecord({
      repo,
      collection,
      rkey,
      record: {
        ...(existing.data.value as Record<string, unknown>),
        ...(description ? { description } : {}),
        content: markpubContent,
      },
      swapRecord: existing.data.cid,
    });

    markpubState.posts[relativePath] = {
      atUri,
      contentHash: syncHash,
      description,
    };

    updatedCount += 1;
    console.log(`Updated ${file} (${atUri})`);
  }

  if (!dryRun) {
    await saveMarkpubState(markpubState);
  }

  console.log(
    dryRun
      ? `Markpub dry run complete: ${updatedCount} would update, ${skippedCount} unchanged, ${pendingCount} waiting for atUri`
      : `Markpub sync complete: ${updatedCount} updated, ${skippedCount} unchanged, ${pendingCount} waiting for atUri`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
