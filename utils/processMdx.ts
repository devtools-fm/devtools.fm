import renderToString from "next-mdx-remote/render-to-string";
import { execSync } from "child_process";
import matter from "gray-matter";
import { MdxRemote } from "next-mdx-remote/types";
import { PromiseValue } from "type-fest";

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

const TAB_SECTION_REGEX = /^<!-- TAB: (.*) -->/;

const TRANSCRIPT_TAB_SECTION_REGEX = /^<!-- TAB: TRANSCRIPT -->/;
const SECTIONS_TAB_SECTION_REGEX = /^<!-- TAB: SECTIONS -->/;
const SHOW_NOTES_TAB_SECTION_REGEX = /^<!-- TAB: SHOW NOTES -->/;
const LINKS_REGEX = /^<!-- LINKS -->/;

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
  mdx: MdxRemote.Source;
}

export interface MDXTab {
  type: string;
  mdx: MdxRemote.Source;
}

export interface SectionsTab {
  type: "SECTIONS";
  sections: ReturnType<typeof parsePodcastSections>;
}

export interface TranscriptTab {
  type: "TRANSCRIPT";
  raw: string;
  mdx: MdxRemote.Source;
}

export type TabSection = ShowNotesTab | SectionsTab | TranscriptTab | MDXTab;

async function parseTabs(raw: string, components: MdxRemote.Components) {
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

      let mdx = showNotesTab.description;

      for (const mdxLine of lineIterator) {
        mdx += `${mdxLine}\n`;

        if (lineIterator.peek().match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      showNotesTab.description = showNotesTab.description.trim();
      showNotesTab.mdx = await renderToString(mdx, {
        components,
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
      transcriptTab.mdx = await renderToString(mdx, {
        components,
      });

      tabs.push(transcriptTab as TranscriptTab);
    } else {
      const [, type] = line.match(TAB_SECTION_REGEX);
      const mdxTab: Partial<MDXTab> = { type };
      let mdx = "";

      for (const transcriptLine of lineIterator) {
        mdx += `${transcriptLine}\n`;

        if (lineIterator.peek()?.match(TAB_SECTION_REGEX)) {
          break;
        }
      }

      mdxTab.mdx = await renderToString(mdx, {
        components,
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
}

export async function processMdx(
  filename: string,
  components: MdxRemote.Components
) {
  const { data, content } = matter.read(filename);

  const [, number] = filename.match(/\/(\d+)\.mdx$/);
  const [, youtubeId] = data.youtube.match(/\?v=(.*)$/);
  const [, spotifyEpisodeId] = data.spotify.match(/\/episodes\/(.+)/);

  const tabSections = await parseTabs(content, components);
  const sectionsTab = tabSections.find(
    (tab) => tab.type === "SECTIONS"
  ) as SectionsTab;
  const transcriptTab = tabSections.find(
    (tab) => tab.type === "TRANSCRIPT"
  ) as TranscriptTab;

  const guests = new Set<string>();

  transcriptTab.raw.match(/^\*\*(\S+)\*\*/gm).map((m) => {
    const person = m.replace(/\*\*/g, "").replace(":", "");

    if (!hosts.includes(person)) {
      guests.add(person);
    }
  });

  return {
    number,
    hosts,
    postCreationDate: getGitCreationDate(filename),
    guests: [...guests],
    runTime: sectionsTab.sections[sectionsTab.sections.length - 1].time,
    youtubeId,
    spotifyEpisodeId,
    frontMatter: data as FrontMatter,
    tabSections,
  };
}

export type ProcessedMdx = PromiseValue<ReturnType<typeof processMdx>>;
