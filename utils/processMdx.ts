import renderToString from "next-mdx-remote/render-to-string";
import matter from "gray-matter";
import { MdxRemote } from "next-mdx-remote/types";
import { PromiseValue } from "type-fest";

const hosts = ["Andrew", "Justin"];

function parseSections(raw: string) {
  const sections: { time: string; title: string }[] = [];

  raw.split("\n").map((line) => {
    const [, time, title] = line.match(/^(\[[\d:]+\]) (.*)/) || [];

    if (time && title) {
      sections.push({ time, title: title.trim() });
    }
  });

  return sections;
}

export async function processMdx(
  filename: string,
  components: MdxRemote.Components
) {
  const { data, content } = matter.read(filename);

  const [showNotesMdx, rest] = content.split("<!-- SECTIONS -->");
  const description = showNotesMdx
    .split("<!-- LINKS -->")[0]
    .split("<!-- DESCRIPTION -->")[1]
    .trim();
  const [sections, transcriptMdx] = rest.split("<!-- Transcript -->");
  const [, number] = filename.match(/\/(\d+)\.mdx$/);
  const guests = new Set<string>();
  const runTimes = sections.match(/^\[([\d:]+)\]/gm);
  const [, youtubeId] = data.youtube.match(/\?v=(.*)$/);
  const [, buzzSproutEpisodeId] = data.buzzsprout.match(/1772992\/(\d+)-/);

  transcriptMdx.match(/^\*\*(\S+)\*\*/gm).map((m) => {
    const person = m.replace(/\*\*/g, "").replace(":", "");

    if (!hosts.includes(person)) {
      guests.add(person);
    }
  });

  return {
    number,
    hosts,
    description,
    guests: [...guests],
    runTime: runTimes[runTimes.length - 1],
    youtubeId,
    buzzSproutEpisodeId,
    frontMatter: data,
    showNotes: await renderToString(showNotesMdx, {
      components,
    }),
    sections: parseSections(sections),
    transcript: await renderToString(transcriptMdx, {
      components,
    }),
  };
}

export type ProcessedMdx = PromiseValue<ReturnType<typeof processMdx>>;
