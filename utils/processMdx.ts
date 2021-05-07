import renderToString from "next-mdx-remote/render-to-string";
import matter from "gray-matter";
import { MdxRemote } from "next-mdx-remote/types";
import { PromiseValue } from "type-fest";

const hosts = ["Andrew", "Justin"];

export async function processMdx(
  filename: string,
  components: MdxRemote.Components
) {
  const { data, content } = matter.read(filename);

  const [showNotesMdx, rest] = content.split("<!-- SECTIONS -->");
  const [sectionsMdx, transcriptMdx] = rest.split("<!-- Transcript -->");
  const [, number] = filename.match(/\/(\d+)\.mdx$/);
  const guests = new Set<string>();
  const [, runTime] = sectionsMdx.match(/^\[([\d:]+)\]/gm);
  const [, youtubeId] = data.youtube.match(/\?v=(.*)$/);

  transcriptMdx.match(/^\*\*(\S+)\*\*/gm).map((m) => {
    const person = m.replace(/\*\*/g, "").replace(":", "");

    if (!hosts.includes(person)) {
      guests.add(person);
    }
  });

  return {
    number,
    hosts,
    guests: [...guests],
    runTime,
    youtubeId,
    frontMatter: data,
    showNotes: await renderToString(showNotesMdx, {
      components,
    }),
    sections: await renderToString(sectionsMdx, {
      components,
    }),
    transcript: await renderToString(transcriptMdx, {
      components,
    }),
  };
}

export type ProcessedMdx = PromiseValue<ReturnType<typeof processMdx>>;
