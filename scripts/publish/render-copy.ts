/**
 * Render each platform's copy from pages/episode/<N>.mdx.
 *
 *   pnpm episode:copy 179
 *
 * Writes to .generated/publish/<N>/:
 *   show-notes.html     rich text for the free Spotify episode (free-cut chapters, with the ad)
 *   show-notes-paid.html  the same with full-cut chapters, for paid Spotify and Patreon
 *   show-notes.txt      the same, plain
 *   youtube-free.txt    description with free-cut chapters + subscribe links
 *   youtube-paid.txt    description with full-cut chapters (full.sections.txt)
 *   youtube-tags.txt    comma separated, trimmed to YouTube's 500 character limit
 *   youtube-title.txt
 *   transcript-full.txt Patreon attachment: full.txt with real speaker names and corrections
 */
import fs from "fs";

import matter from "gray-matter";

import { cleanPlainTranscript } from "./transcript";
import {
  config,
  episodeFile,
  episodeUrl,
  fail,
  mdxPath,
  parseArgs,
  parseSectionsFile,
  requireEpisode,
} from "./lib";

const TAB = (name: string) => new RegExp(`^\\{?/\\*\\s*${name}\\s*\\*/\\}?\\s*$`, "m");

export function readEpisodeMdx(episode: string) {
  const file = mdxPath(episode);
  if (!fs.existsSync(file)) fail(`${file} doesn't exist. Run \`pnpm episode:mdx ${episode} build\` first.`);

  const { data, content } = matter.read(file);
  const showNotesBlock = content.split(TAB("TAB: SHOW NOTES"))[1]?.split(TAB("LINKS"))[0] || "";
  const sectionsBlock = content.split(TAB("TAB: SECTIONS"))[1]?.split(TAB("TAB: TRANSCRIPT"))[0] || "";
  const lines = showNotesBlock.trim().split("\n");
  // Markdown semantics: consecutive lines are one paragraph, blank lines split them.
  const paragraphs = showNotesBlock
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.trim() && !line.trim().startsWith("- "))
        .map((line) => unescape(line.trim()))
        .join(" ")
    )
    .filter(Boolean);

  return {
    data,
    paragraphs,
    links: lines.filter((line) => line.trim().startsWith("- ")).map((line) => line.trim().slice(2).trim()),
    sections: parseSectionsFile(sectionsBlock),
    tags: String(data.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function unescape(text: string) {
  return text.replace(/\\([{}<])/g, "$1");
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Markdown links → <a>, bare URLs → <a>. Show notes rarely use more than that. */
function inlineHtml(text: string) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
}

function plain(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 ($2)");
}

/** YouTube only turns a description into chapters if it starts at 0:00 and has 3+ entries. */
export function checkYoutubeChapters(sections: ReturnType<typeof parseSectionsFile>) {
  const problems: string[] = [];
  if (sections.length < 3) problems.push("YouTube needs at least 3 chapters.");
  if (sections[0]?.seconds !== 0) problems.push("The first chapter must start at 00:00:00.");
  sections.forEach((section, i) => {
    const next = sections[i + 1];
    if (next && next.seconds - section.seconds < 10) problems.push(`"${section.title}" is shorter than 10 seconds.`);
  });
  return problems;
}

function youtubeDescription(
  paragraphs: string[],
  links: string[],
  sections: ReturnType<typeof parseSectionsFile>,
  footer: string[],
  url: string
) {
  return [
    paragraphs.map(plain).join("\n\n"),
    links.join("\n"),
    sections.map((section) => `${section.time} ${section.title}`).join("\n"),
    footer.join("\n").replace(/\{episodeUrl\}/g, url),
  ]
    .filter((block) => block.trim())
    .join("\n\n");
}

function main() {
  const { positionals } = parseArgs();
  const episode = requireEpisode(positionals);
  const { data, paragraphs, links, sections, tags } = readEpisodeMdx(episode);
  const url = episodeUrl(episode);
  const write = (name: string, text: string) => {
    fs.writeFileSync(episodeFile(episode, name), text.endsWith("\n") ? text : `${text}\n`);
    console.log(`+ ${episodeFile(episode, name)}`);
  };

  const showNotesHtml = (chapters: ReturnType<typeof parseSectionsFile>) =>
    [
      ...paragraphs.map((p) => `<p>${inlineHtml(p)}</p>`),
      links.length ? `<ul>${links.map((link) => `<li>${inlineHtml(link)}</li>`).join("")}</ul>` : "",
      `<p>${chapters.map((s) => `${s.time} ${escapeHtml(s.title)}`).join("<br>")}</p>`,
      `<p>Full show notes and transcript: <a href="${url}">${url}</a></p>`,
    ]
      .filter(Boolean)
      .join("\n");
  write("show-notes.html", showNotesHtml(sections));
  write(
    "show-notes.txt",
    [paragraphs.map(plain).join("\n\n"), links.join("\n"), sections.map((s) => `${s.time} ${s.title}`).join("\n"), `Full show notes and transcript: ${url}`]
      .filter(Boolean)
      .join("\n\n")
  );

  write("youtube-title.txt", String(data.title));

  const infoFile = episodeFile(episode, "episode.json");
  const info = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile, "utf8")) : {};
  const fullTxt = episodeFile(episode, "full.txt");
  if (fs.existsSync(fullTxt)) {
    write("transcript-full.txt", cleanPlainTranscript(fs.readFileSync(fullTxt, "utf8"), info.corrections, info.speakers));
  }
  write("youtube-free.txt", youtubeDescription(paragraphs, links, sections, config.youtube.freeFooter, url));

  const fullSectionsFile = episodeFile(episode, "full.sections.txt");
  const fullSections = fs.existsSync(fullSectionsFile)
    ? parseSectionsFile(fs.readFileSync(fullSectionsFile, "utf8"))
    : sections.filter((section) => !/^ad$/i.test(section.title));
  if (!fs.existsSync(fullSectionsFile)) {
    console.warn("! No full.sections.txt; the paid description reuses the free chapters minus the ad, so later timestamps will be off.");
  }
  write("youtube-paid.txt", youtubeDescription(paragraphs, links, fullSections, config.youtube.paidFooter, url));
  // Paid platforms (Spotify subscribers, Patreon) get the ad-free cut's chapter times.
  write("show-notes-paid.html", showNotesHtml(fullSections));

  const tagList: string[] = [];
  for (const tag of [...new Set([...tags, ...config.youtube.baseTags])]) {
    // YouTube counts quotes around multi-word tags toward the 500 limit.
    const cost = tag.length + (tag.includes(" ") ? 2 : 0) + (tagList.length ? 1 : 0);
    if (tagList.join(",").length + cost > 500) break;
    tagList.push(tag);
  }
  write("youtube-tags.txt", tagList.join(", "));

  for (const [label, list] of [
    ["free", sections],
    ["paid", fullSections],
  ] as const) {
    for (const problem of checkYoutubeChapters(list)) console.warn(`! ${label} chapters: ${problem}`);
  }
}

if (require.main === module) {
  main();
}
