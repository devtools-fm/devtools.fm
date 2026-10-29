/**
 * Keep the episode's GitHub issue checklist in sync with the pipeline.
 *
 *   pnpm episode:checklist 179 ensure                 # find or create the issue
 *   pnpm episode:checklist 179 status                 # print every item with its path
 *   pnpm episode:checklist 179 tick "Full/Vtt" "YouTube/Upload Free/Add Tags"
 *   pnpm episode:checklist 179 untick "Patreon/Video/Upload"
 *   pnpm episode:checklist 179 close
 *
 * Items are addressed by path: headings and parent items, then the label, joined with `/`.
 * Each segment matches case-insensitively by prefix, and segments may skip levels, so
 * "Patreon/Video/Upload" and "Video/Upload" both find the same box. A path that matches
 * more than one box is an error.
 */
import fs from "fs";
import path from "path";

import { config, fail, parseArgs, readState, requireEpisode, ROOT, run, updateState } from "./lib";

type Item = { line: number; checked: boolean; label: string; path: string[] };

const REPO = config.github.repo;

export function parseChecklist(body: string) {
  const lines = body.split("\n");
  const headings: { level: number; text: string }[] = [];
  const parents: { indent: number; label: string }[] = [];
  const items: Item[] = [];

  lines.forEach((line, index) => {
    const heading = line.match(/^(#{2,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      while (headings.length && headings[headings.length - 1].level >= level) headings.pop();
      headings.push({ level, text: heading[2].trim() });
      parents.length = 0;
      return;
    }

    const item = line.match(/^(\s*)- \[( |x|X)\] (.*)$/);
    if (!item) return;

    const indent = item[1].length;
    const label = item[3].trim();
    while (parents.length && parents[parents.length - 1].indent >= indent) parents.pop();

    items.push({
      line: index,
      checked: item[2] !== " ",
      label,
      path: [...headings.map((h) => h.text), ...parents.map((p) => p.label), label],
    });
    parents.push({ indent, label });
  });

  return { lines, items };
}

const norm = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

function matches(item: Item, query: string) {
  const segments = query.split("/").map(norm).filter(Boolean);
  const itemPath = item.path.map(norm);

  // The last segment must be this item's own label.
  if (!itemPath[itemPath.length - 1].startsWith(segments[segments.length - 1])) return false;

  let cursor = 0;
  for (const segment of segments.slice(0, -1)) {
    while (cursor < itemPath.length - 1 && !itemPath[cursor].startsWith(segment)) cursor++;
    if (cursor >= itemPath.length - 1) return false;
    cursor++;
  }

  return true;
}

export function setChecked(body: string, queries: string[], checked: boolean) {
  const { lines, items } = parseChecklist(body);

  for (const query of queries) {
    const found = items.filter((item) => matches(item, query));

    if (found.length === 0) throw new Error(`No checklist item matches "${query}"`);
    if (found.length > 1) {
      throw new Error(
        `"${query}" is ambiguous:\n${found.map((item) => `  - ${item.path.join(" / ")}`).join("\n")}`
      );
    }

    const [item] = found;
    lines[item.line] = lines[item.line].replace(/- \[( |x|X)\]/, checked ? "- [x]" : "- [ ]");

    // A parent is done once every child under it is done.
    if (checked) {
      for (const parent of items) {
        const children = items.filter(
          (other) =>
            other.path.length === parent.path.length + 1 &&
            parent.path.every((segment, i) => other.path[i] === segment)
        );
        const childrenDone = children.every((child) => /- \[x\]/i.test(lines[child.line]));
        if (children.length && childrenDone) {
          lines[parent.line] = lines[parent.line].replace(/- \[ \]/, "- [x]");
        }
      }
    }
  }

  return lines.join("\n");
}

function issueTitles(episode: string) {
  return [episode, `Episode ${episode}`];
}

function findIssue(episode: string) {
  const cached = readState(episode).issue;
  if (cached) return cached;

  const raw = run("gh", [
    "issue",
    "list",
    "--repo",
    REPO,
    "--state",
    "all",
    "--search",
    `${episode} in:title`,
    "--json",
    "number,title,url",
  ]);
  const issue = (JSON.parse(raw) as { number: number; title: string; url: string }[]).find((i) =>
    issueTitles(episode).includes(i.title.trim())
  );

  if (issue) {
    updateState(episode, (state) => (state.issue = { number: issue.number, url: issue.url }));
  }

  return issue ? { number: issue.number, url: issue.url } : undefined;
}

export function ensureIssue(episode: string) {
  const existing = findIssue(episode);
  if (existing) return existing;

  const template = fs
    .readFileSync(path.join(ROOT, ".github", "ISSUE_TEMPLATE.md"), "utf8")
    .replace(/^# Episode X/m, `# Episode ${episode}`);
  const url = run("gh", ["issue", "create", "--repo", REPO, "--title", episode, "--body", template]).trim();
  const number = Number(url.split("/").pop());
  updateState(episode, (state) => (state.issue = { number, url }));
  return { number, url };
}

function readBody(number: number) {
  return run("gh", ["issue", "view", String(number), "--repo", REPO, "--json", "body", "-q", ".body"]).replace(
    /\n$/,
    ""
  );
}

function writeBody(number: number, body: string) {
  run("gh", ["issue", "edit", String(number), "--repo", REPO, "--body-file", "-"], { input: body });
}

export function tick(episode: string, queries: string[], checked = true) {
  const issue = ensureIssue(episode);
  const body = readBody(issue.number);
  const next = setChecked(body, queries, checked);

  if (next !== body) writeBody(issue.number, next);
}

async function main() {
  const { positionals } = parseArgs();
  const episode = requireEpisode(positionals);
  const [command = "status", ...queries] = positionals.slice(positionals.indexOf(episode) + 1);

  try {
    switch (command) {
      case "ensure": {
        console.log(ensureIssue(episode).url);
        break;
      }
      case "status": {
        const issue = ensureIssue(episode);
        const { items } = parseChecklist(readBody(issue.number));
        console.log(issue.url);
        for (const item of items) {
          console.log(`${item.checked ? "[x]" : "[ ]"} ${item.path.join(" / ")}`);
        }
        break;
      }
      case "tick":
      case "untick": {
        if (!queries.length) fail("Pass at least one item path.");
        tick(episode, queries, command === "tick");
        console.log(`${command === "tick" ? "Ticked" : "Unticked"}: ${queries.join(", ")}`);
        break;
      }
      case "close": {
        const issue = ensureIssue(episode);
        run("gh", ["issue", "close", String(issue.number), "--repo", REPO]);
        console.log(`Closed ${issue.url}`);
        break;
      }
      default:
        fail(`Unknown command "${command}". Use ensure, status, tick, untick or close.`);
    }
  } catch (error) {
    fail((error as Error).message);
  }
}

if (require.main === module) {
  main();
}
