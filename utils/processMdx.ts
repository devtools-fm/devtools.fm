import renderToString from "next-mdx-remote/render-to-string";
import { execSync } from "child_process";
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

function getGitCreationDate(filename: string) {
  return execSync(`git log --format=%aD ${filename} | tail -1`, {
    encoding: "utf-8",
  });
}

interface FrontMatter {
  title: string;
  youtube: string;
  buzzsprout: string;
}

export async function processMdx(
  filename: string,
  components: MdxRemote.Components
) {
  const { data, content } = matter.read(filename);

  const [showNotes, rest] = content.split("<!-- SECTIONS -->");
  const description = showNotes
    .split("<!-- LINKS -->")[0]
    .split("<!-- DESCRIPTION -->")[1]
    .trim();
  const [sections, transcript] = rest.split("<!-- Transcript -->");
  const [, number] = filename.match(/\/(\d+)\.mdx$/);
  const guests = new Set<string>();
  const runTimes = sections.match(/^\[([\d:]+)\]/gm);
  const [, youtubeId] = data.youtube.match(/\?v=(.*)$/);
  const [, buzzSproutEpisodeId] = data.buzzsprout.match(/1772992\/(\d+)-/);

  transcript.match(/^\*\*(\S+)\*\*/gm).map((m) => {
    const person = m.replace(/\*\*/g, "").replace(":", "");

    if (!hosts.includes(person)) {
      guests.add(person);
    }
  });

  const showNotesMdx = await renderToString(showNotes, {
    components,
  });

  const transcriptMdx = await renderToString(transcript, {
    components,
  });

  return {
    number,
    hosts,
    description,
    postCreationDate: getGitCreationDate(filename),
    guests: [...guests],
    runTime: runTimes[runTimes.length - 1],
    youtubeId,
    buzzSproutEpisodeId,
    frontMatter: data as FrontMatter,
    showNotes: showNotesMdx,
    sections: parseSections(sections),
    transcript: transcriptMdx,
  };
}

export type ProcessedMdx = PromiseValue<ReturnType<typeof processMdx>>;
