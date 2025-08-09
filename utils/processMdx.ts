import { serialize } from "next-mdx-remote/serialize";
import { execSync } from "child_process";
import matter from "gray-matter";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { PromiseValue } from "type-fest";
import remarkGfm from "remark-gfm";

const hosts = ["Andrew", "Justin"];

function parsePodcastSections(raw: string) {
  const sections: { time: string; title: string }[] = [];

  raw.split("\n").map((line) => {
    const [, time, title] = line.match(/^(\[[\d:]+\]) (.*)/) || [];

    if (time && title) {
      sections.push({ time, title: title.trim() });
    }
  });

  return sections;
}

function getGitCreationDate(filename: string) {
  return execSync(`git log --format=%aD ${filename} | tail -1`, {
    encoding: "utf-8",
  });
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
  mdx: MDXRemoteSerializeResult;
}

export interface MDXTab {
  type: string;
  mdx: MDXRemoteSerializeResult;
}

export interface SectionsTab {
  type: "SECTIONS";
  sections: ReturnType<typeof parsePodcastSections>;
}

export interface TranscriptTab {
  type: "TRANSCRIPT";
  raw: string;
  mdx: MDXRemoteSerializeResult;
}

export type TabSection = ShowNotesTab | SectionsTab | TranscriptTab | MDXTab;

async function parseTabs(raw: string, components: any) {
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
      showNotesTab.mdx = await serialize(mdx, {
        mdxOptions: {
          development: process.env.NODE_ENV === "development",
          remarkPlugins: [remarkGfm],
        },
      });

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
      transcriptTab.mdx = await serialize(mdx, {
        mdxOptions: {
          development: process.env.NODE_ENV === "development",
          remarkPlugins: [remarkGfm],
        },
      });

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

      mdxTab.mdx = await serialize(mdx, {
        mdxOptions: {
          development: process.env.NODE_ENV === "development",
          remarkPlugins: [remarkGfm],
        },
      });

      tabs.push(mdxTab as MDXTab);
    }
  }

  return tabs;
}

interface FrontMatter {
  title: string;
  youtube: string;
  spotify: string;
  date?: string;
  sponsor?: string | string[];
}

export async function processMdx(
  filename: string,
  components: any,
  includeTranscriptAndDescription = false,
  includeSection = true
) {
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

  const tabSections = await parseTabs(content, components);
  const showNotesTab = tabSections.find(
    (tab) => tab.type === "SHOW NOTES"
  ) as ShowNotesTab;
  const sectionsTab = tabSections.find(
    (tab) => tab.type === "SECTIONS"
  ) as SectionsTab;
  const transcriptTab = tabSections.find(
    (tab) => tab.type === "TRANSCRIPT"
  ) as TranscriptTab;

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
    postCreationDate: data.date || getGitCreationDate(filename),
    guests: [...guests],
    runTime: sectionsTab?.sections?.[sectionsTab.sections.length - 1]?.time || "0:00",
    youtubeId,
    thumbnailId,
    spotifyEpisodeId,
    spotifyEpisodeIdAlt,
    frontMatter: data as FrontMatter,
    tabSections: includeSection ? tabSections : [],
    description: includeTranscriptAndDescription
      ? showNotesTab?.description?.split("\n\n")[0] || ""
      : "",
    transcript: includeTranscriptAndDescription ? transcriptTab?.raw || "" : "",
  };
}

export type ProcessedMdx = PromiseValue<ReturnType<typeof processMdx>>;
