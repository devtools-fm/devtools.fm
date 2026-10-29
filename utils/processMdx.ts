import { execSync } from "node:child_process";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { buildEpisodeDescription, normalizeEpisodeDescription } from "utils/episodeDescription";

const hosts = ["Andrew", "Justin"];
const STANDALONE_MDX_COMMENT_REGEX = /^\s*\{\/\*.*\*\/\}\s*$/gm;

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value || "";
  return (node.children || []).map(hastText).join("");
}

// Mirrors the old next-mdx-remote `strong` component: Andrew's speaker labels
// are blue, everyone else's are purple (see `.episode-content strong` in globals.css).
function rehypeSpeakerColors() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "strong" && hastText(node).includes("Andrew")) {
        node.properties = { ...node.properties, className: ["speaker-andrew"] };
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

async function renderMarkdown(raw: string) {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSpeakerColors)
      .use(rehypeStringify)
      .process(raw.replace(STANDALONE_MDX_COMMENT_REGEX, ""))
  );
}

export function parsePodcastSections(raw: string) {
  const sections: { time: string; title: string }[] = [];

  raw.split("\n").forEach((line) => {
    const [, time, title] = line.match(/^(\[[\d:]+\]) (.*)/) || [];

    if (time && title) {
      sections.push({ time, title: title.trim() });
    }
  });

  return sections;
}

// Fallback only: every episode sets publishDate/date in frontmatter. Vercel builds
// from a shallow clone, so git history here is not reliable outside local dev.
function getGitCreationDate(filename: string) {
  try {
    return execSync(`git log --format=%aD ${filename} | tail -1`, {
      encoding: "utf-8",
    }).trim();
  } catch {
    return "";
  }
}

const TAB_SECTION_REGEX = /^(?:<!--\s*TAB:\s*(.*)\s*-->|\{?\/\*\s*TAB:\s*(.*)\s*\*\/\}?)/;

const TRANSCRIPT_TAB_SECTION_REGEX = /^(?:<!--\s*TAB:\s*TRANSCRIPT\s*-->|\{?\/\*\s*TAB:\s*TRANSCRIPT\s*\*\/\}?)/;
const SECTIONS_TAB_SECTION_REGEX = /^(?:<!--\s*TAB:\s*SECTIONS\s*-->|\{?\/\*\s*TAB:\s*SECTIONS\s*\*\/\}?)/;
const SHOW_NOTES_TAB_SECTION_REGEX = /^(?:<!--\s*TAB:\s*SHOW NOTES\s*-->|\{?\/\*\s*TAB:\s*SHOW NOTES\s*\*\/\}?)/;
const LINKS_REGEX = /^(?:<!--\s*LINKS\s*-->|\{?\/\*\s*LINKS\s*\*\/\}?)/;

function peekableIterator(array: string[]) {
  var i = 0;
  const next = () => {
    i += 1;
    return array[i - 1];
  };

  return {
    next,
    peek: () => {
      return array[i];
    },
    [Symbol.iterator]: function* () {
      let value = next();

      while (value !== undefined) {
        yield value;
        value = next();
      }
    },
    hasNext: function () {
      return i < array.length;
    },
  };
}

export interface ShowNotesTab {
  type: "SHOW NOTES";
  description: string;
  html: string;
}

export interface MDXTab {
  type: string;
  html: string;
}

export interface SectionsTab {
  type: "SECTIONS";
  sections: ReturnType<typeof parsePodcastSections>;
}

export interface TranscriptTab {
  type: "TRANSCRIPT";
  raw: string;
  html: string;
}

export type TabSection = ShowNotesTab | SectionsTab | TranscriptTab | MDXTab;

async function parseTabs(raw: string) {
  const tabs: TabSection[] = [];
  const lineIterator = peekableIterator(raw.trim().split("\n"));

  for (const line of lineIterator) {
    if (line.match(SHOW_NOTES_TAB_SECTION_REGEX)) {
      const showNotesTab: Partial<ShowNotesTab> = {
        type: "SHOW NOTES",
        description: "",
      };

      for (const descriptionLine of lineIterator) {
        if (descriptionLine.match(LINKS_REGEX)) {
          break;
        }

        showNotesTab.description += `${descriptionLine}\n`;
      }

      let mdx = showNotesTab.description || "";

      for (const mdxLine of lineIterator) {
        mdx += `${mdxLine}\n`;

        if (lineIterator.peek().match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      showNotesTab.description = showNotesTab.description?.trim() || "";
      showNotesTab.html = await renderMarkdown(mdx);

      tabs.push(showNotesTab as ShowNotesTab);
    } else if (line.match(SECTIONS_TAB_SECTION_REGEX)) {
      const sectionsTab: Partial<SectionsTab> = {
        type: "SECTIONS",
      };
      let sectionsRaw = "";

      for (const sectionLink of lineIterator) {
        sectionsRaw += `${sectionLink}\n`;

        if (lineIterator.peek()?.match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      sectionsTab.sections = parsePodcastSections(sectionsRaw);
      tabs.push(sectionsTab as SectionsTab);
    } else if (line.match(TRANSCRIPT_TAB_SECTION_REGEX)) {
      const transcriptTab: Partial<TranscriptTab> = {
        type: "TRANSCRIPT",
      };
      let mdx = "";

      for (const transcriptLine of lineIterator) {
        mdx += `${transcriptLine}\n`;

        if (lineIterator.peek()?.match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      transcriptTab.raw = mdx;
      transcriptTab.html = await renderMarkdown(mdx);

      tabs.push(transcriptTab as TranscriptTab);
    } else {
      const match = line.match(TAB_SECTION_REGEX);
      if (!match) continue;
      const type = match[1] || match[2]; // Get from either HTML or JSX comment
      if (!type) continue;
      const mdxTab: Partial<MDXTab> = { type };
      let mdx = "";

      for (const transcriptLine of lineIterator) {
        mdx += `${transcriptLine}\n`;

        if (lineIterator.peek()?.match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      mdxTab.html = await renderMarkdown(mdx);

      tabs.push(mdxTab as MDXTab);
    }
  }

  return tabs;
}

interface FrontMatter {
  title: string;
  youtube: string;
  spotify: string;
  publishDate?: string;
  date?: string;
  description?: string;
  tags?: string | string[];
  sponsor?: string | string[];
  atUri?: string;
}

export interface ProcessedMdx {
  number: string;
  hosts: string[];
  postCreationDate: string;
  guests: string[];
  runTime: string;
  youtubeId: string;
  thumbnailId: string | null;
  spotifyEpisodeId: string | null;
  spotifyEpisodeIdAlt: string | null;
  frontMatter: FrontMatter;
  tabSections: TabSection[];
  description: string;
  transcript: string;
}

export async function processMdx(
  filename: string,
  includeTranscriptAndDescription = false,
  includeSection = true
): Promise<ProcessedMdx> {
  const { data, content } = matter.read(filename);

  const numberMatch = filename.match(/\/(\d+)\.mdx$/);  
  const number = numberMatch?.[1] || "0";
  const youtubeMatch = data.youtube.match(/\?v=(.*)$/);
  const youtubeId = youtubeMatch?.[1] || "";
  const thumbnailMatch = (data.thumbnail || "").match(/\?v=(.*)$/);
  const thumbnailId = thumbnailMatch?.[1] || null;
  const spotifyMatch = data.spotify.match(/\/episodes\/(.+)/);
  const spotifyEpisodeId = spotifyMatch?.[1] || null;
  const spotifyAltMatch = data.spotify.match(/\/episode\/(.+)/);
  const spotifyEpisodeIdAlt = spotifyAltMatch?.[1] || null;

  const tabSections = await parseTabs(content);
  const showNotesTab = tabSections.find(
    (tab): tab is ShowNotesTab => "description" in tab
  );
  const sectionsTab = tabSections.find(
    (tab): tab is SectionsTab => "sections" in tab
  );
  const transcriptTab = tabSections.find(
    (tab): tab is TranscriptTab => "raw" in tab
  );

  const guests = new Set<string>();

  if (transcriptTab) {
    transcriptTab.raw.match(/^\*\*(.+)\*\*/gm)?.map((m) => {
      const person = m.replace(/\*\*/g, "").replace(":", "");

      if (!hosts.includes(person)) {
        guests.add(person);
      }
    });
  }

  return {
    number,
    hosts,
    postCreationDate: data.publishDate || data.date || getGitCreationDate(filename),
    guests: [...guests],
    runTime: sectionsTab?.sections?.[sectionsTab.sections.length - 1]?.time || "0:00",
    youtubeId,
    thumbnailId,
    spotifyEpisodeId,
    spotifyEpisodeIdAlt,
    frontMatter: data as FrontMatter,
    tabSections: includeSection ? tabSections : [],
    description:
      typeof data.description === "string" && data.description.trim()
        ? normalizeEpisodeDescription(data.description)
        : buildEpisodeDescription({
            showNotes: showNotesTab?.description || "",
            sections: sectionsTab?.sections || [],
          }),
    transcript: includeTranscriptAndDescription ? transcriptTab?.raw || "" : "",
  };
}

