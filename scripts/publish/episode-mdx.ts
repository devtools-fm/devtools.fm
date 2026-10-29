/**
 * Build or patch pages/episode/<N>.mdx.
 *
 *   pnpm episode:mdx 179 build [--out path] [--force]
 *   pnpm episode:mdx 179 set youtube https://www.youtube.com/watch?v=…
 *   pnpm episode:mdx 179 set spotify https://open.spotify.com/episode/…
 *   pnpm episode:mdx 179 check                     # parse with processMdx like the site does
 *
 * `build` reads from .generated/publish/<N>/:
 *   episode.json        { title, showNotes, links[], tags[], sponsor?, publishDate, description? }
 *   free.sections.txt   `[hh:mm:ss] Title` per line (the website follows the free cut)
 *   free.transcript.md  Descript Markdown export with speaker labels + timecodes
 */
import fs from "fs";

import matter from "gray-matter";

import { buildEpisodeDescriptionContext, generateEpisodeDescription } from "utils/generateEpisodeDescription";
import { normalizeEpisodeDescription } from "utils/episodeDescription";
import { processMdx } from "utils/processMdx";

import { applyCorrections, speakerName } from "./transcript";
import {
  config,
  episodeFile,
  fail,
  mdxPath,
  normalizeTimestamp,
  parseArgs,
  parseSectionsFile,
  readState,
  requireEpisode,
  toSeconds,
} from "./lib";

export type EpisodeInfo = {
  title: string;
  /** Whole-word fixes for transcription mistakes, e.g. { "Tain": "Tane" }. */
  corrections?: Record<string, string>;
  /** Rename speaker labels Descript couldn't resolve, e.g. { "Speaker": "Justin" } for the ad read. */
  speakers?: Record<string, string>;
  description?: string;
  showNotes: string;
  links: string[];
  tags: string[];
  sponsor?: string | string[];
  publishDate: string;
  youtube?: string;
  spotify?: string;
};

type Paragraph = { speaker?: string; seconds?: number; text: string };

const TIMECODE = /[\[(]?\b((?:\d{1,2}:)?\d{1,2}:\d{2})(?:[.,]\d+)?\b[\])]?/;
const SPEAKER_BOLD = /^\*\*([^*]{1,80}?):?\*\*:?\s*/;
const SPEAKER_PLAIN = /^([A-Z][\w'.-]*(?:\s[A-Z][\w'.-]*){0,3}):\s+/;

/** Descript's Markdown export → paragraphs with speaker + start time. */
export function parseDescriptTranscript(raw: string) {
  const paragraphs: Paragraph[] = [];
  let pendingSpeaker: string | undefined;
  let pendingSeconds: number | undefined;

  for (const block of raw.replace(/\r/g, "").replace(/\u200b/g, "").split(/\n\s*\n/)) {
    let text = block.replace(/\s*\n\s*/g, " ").trim();
    if (!text || /^#+\s/.test(text)) continue;

    let speaker: string | undefined;
    let seconds: number | undefined;

    // Timecodes and speaker labels can come in either order at the start of a paragraph.
    for (let i = 0; i < 3; i++) {
      const time = text.match(new RegExp(`^${TIMECODE.source}\\s*`));
      if (time) {
        seconds ??= toSeconds(time[1]);
        text = text.slice(time[0].length);
        continue;
      }

      const bold = text.match(SPEAKER_BOLD) || (!speaker ? text.match(SPEAKER_PLAIN) : null);
      if (bold && !speaker) {
        speaker = speakerName(bold[1]);
        text = text.slice(bold[0].length);
        continue;
      }

      break;
    }

    text = text.trim();

    // A label or timecode on a line of its own applies to the next paragraph.
    if (!text) {
      pendingSpeaker = speaker ?? pendingSpeaker;
      pendingSeconds = seconds ?? pendingSeconds;
      continue;
    }

    paragraphs.push({
      speaker: speaker ?? pendingSpeaker,
      seconds: seconds ?? pendingSeconds,
      text,
    });
    pendingSpeaker = undefined;
    pendingSeconds = undefined;
  }

  return paragraphs;
}

/** Keep transcript text from being read as JSX or expressions. */
function escapeMdx(text: string) {
  return text.replace(/[{}]/g, "\\$&").replace(/<(?=[A-Za-z/!])/g, "\\<");
}

export function renderTranscript(paragraphs: Paragraph[], sections: ReturnType<typeof parseSectionsFile>) {
  if (!paragraphs.some((p) => p.seconds !== undefined)) {
    throw new Error("The transcript export has no timecodes, so section headings can't be placed.");
  }

  const out: string[] = [];
  let sectionIndex = 0;
  let lastSpeaker: string | undefined;
  let lastSeconds = 0;

  for (const paragraph of paragraphs) {
    lastSeconds = paragraph.seconds ?? lastSeconds;

    while (sectionIndex < sections.length && (sectionIndex === 0 || sections[sectionIndex].seconds <= lastSeconds)) {
      const section = sections[sectionIndex];
      out.push(`#### [${section.time}] ${section.title}`);
      sectionIndex++;
      // A new section always restates who is talking.
      lastSpeaker = undefined;
    }

    if (paragraph.speaker && paragraph.speaker !== lastSpeaker) {
      out.push(`**${paragraph.speaker}:** ${escapeMdx(paragraph.text)}`);
      lastSpeaker = paragraph.speaker;
    } else {
      out.push(escapeMdx(paragraph.text));
    }
  }

  for (; sectionIndex < sections.length; sectionIndex++) {
    console.warn(`! Section "${sections[sectionIndex].title}" starts after the transcript ends.`);
  }

  return out.join("\n\n");
}

function yaml(value: string) {
  return JSON.stringify(value);
}

function listValue(value?: string | string[]) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

async function build(episode: string, out: string, force: boolean) {
  if (fs.existsSync(out) && !force) fail(`${out} exists. Pass --force to overwrite.`);

  const info: EpisodeInfo = JSON.parse(fs.readFileSync(episodeFile(episode, "episode.json"), "utf8"));
  const sectionsRaw = fs.readFileSync(episodeFile(episode, "free.sections.txt"), "utf8");
  const sections = parseSectionsFile(sectionsRaw);
  if (!sections.length) fail("free.sections.txt has no `[hh:mm:ss] Title` lines.");

  const paragraphs = parseDescriptTranscript(fs.readFileSync(episodeFile(episode, "free.transcript.md"), "utf8")).map(
    (paragraph) => ({
      ...paragraph,
      speaker: paragraph.speaker && (info.speakers?.[paragraph.speaker] ?? paragraph.speaker),
      text: applyCorrections(paragraph.text, info.corrections),
    })
  );
  const transcript = renderTranscript(paragraphs, sections);
  const guests = [...new Set(paragraphs.map((p) => p.speaker).filter((s): s is string => !!s))].filter(
    (speaker) => !["Andrew", "Justin"].includes(speaker)
  );

  const description =
    info.description ||
    (await generateEpisodeDescription(
      buildEpisodeDescriptionContext({
        number: episode,
        title: info.title,
        guests,
        tags: info.tags,
        showNotes: info.showNotes,
        sectionsRaw,
      })
    ));

  const state = readState(episode);
  const youtube = info.youtube || (state.youtube?.free ? state.youtube.free.url : "");
  const spotify = info.spotify || state.spotify?.publicUrl || "";
  const tags = [...new Set([...info.tags, ...config.youtube.baseTags])];

  const frontMatter = [
    `title: ${info.title}`,
    `description: ${yaml(normalizeEpisodeDescription(description))}`,
    // Quoted so an empty value is "" rather than null, which processMdx can't handle.
    `youtube: ${yaml(youtube)}`,
    `spotify: ${yaml(spotify)}`,
    `publishDate: ${info.publishDate}`,
    `tags: ${tags.join(", ")}`,
    ...(info.sponsor ? [`sponsor: ${listValue(info.sponsor)}`] : []),
  ];

  const mdx = `---
${frontMatter.join("\n")}
---

{/* TAB: SHOW NOTES */}

${escapeMdx(info.showNotes.trim())}

${info.links.map((link) => `- ${link}`).join("\n")}

{/* LINKS */}

{/* TAB: SECTIONS */}

${sections.map((section) => `[${section.time}] ${section.title}`).join("\n")}

{/* TAB: TRANSCRIPT */}

${transcript}
`;

  fs.writeFileSync(out, mdx);
  console.log(`Wrote ${out} (${sections.length} sections, ${paragraphs.length} paragraphs, guests: ${guests.join(", ") || "none"})`);
}

function setField(episode: string, field: string, value: string) {
  const file = mdxPath(episode);
  if (!fs.existsSync(file)) fail(`${file} doesn't exist yet.`);

  const raw = fs.readFileSync(file, "utf8");
  const pattern = new RegExp(`^${field}:.*$`, "m");
  const next = pattern.test(raw)
    ? raw.replace(pattern, `${field}: ${value}`)
    : raw.replace(/^---\n/, `---\n${field}: ${value}\n`);

  fs.writeFileSync(file, next);
  console.log(`${field}: ${value}`);
}

async function check(file: string) {
  const parsed = await processMdx(file, {}, true, true);
  const { data } = matter.read(file);
  const sections = parsed.tabSections.find((tab) => tab.type === "SECTIONS") as any;

  const problems = [
    !data.title && "missing title",
    !parsed.description && "missing description",
    !parsed.youtubeId && "missing youtube link",
    !parsed.spotifyEpisodeId && !parsed.spotifyEpisodeIdAlt && "missing spotify link",
    !(sections?.sections?.length > 0) && "no sections",
    !parsed.transcript && "no transcript",
    !parsed.guests.length && "no guests detected in transcript",
  ].filter(Boolean);

  console.log(
    `${file}: ${sections?.sections?.length || 0} sections, guests ${parsed.guests.join(", ") || "none"}, runtime ${normalizeTimestamp(
      String(parsed.runTime).replace(/[\[\]]/g, "") || "0:00"
    )}`
  );
  for (const problem of problems) console.log(`! ${problem}`);
  return problems;
}

async function main() {
  const { positionals, flags } = parseArgs();
  const episode = requireEpisode(positionals);
  const [command = "build", field, value] = positionals.slice(positionals.indexOf(episode) + 1);

  switch (command) {
    case "build":
      await build(episode, typeof flags.out === "string" ? flags.out : mdxPath(episode), Boolean(flags.force));
      break;
    case "set":
      if (!field || !value) fail("Usage: set <field> <value>");
      setField(episode, field, value);
      break;
    case "check":
      await check(typeof flags.file === "string" ? flags.file : mdxPath(episode));
      break;
    default:
      fail(`Unknown command "${command}".`);
  }
}

if (require.main === module) {
  main().catch((error) => fail(error.message));
}
