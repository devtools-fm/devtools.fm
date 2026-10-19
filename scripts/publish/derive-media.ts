/**
 * Turn Descript's rendered Full/Free files into what each platform wants.
 *
 *   pnpm episode:derive-media 179
 *
 * Reads from .generated/publish/<N>/ (written by `episode:descript publish`):
 *   full.mp4 / free.mp4 (or full-audio.* / free-audio.*), full.srt / free.srt
 * Writes:
 *   full-mono.mp3   Patreon audio post (the paid Spotify episode uses full.mp4 itself)
 *   free-mono.mp3   Spotify free episode
 *   full.vtt / free.vtt  YouTube captions
 */
import fs from "fs";

import { episodeFile, fail, hasCommand, parseArgs, requireEpisode, run } from "./lib";
import { applyCorrections } from "./transcript";

function source(episode: string, kind: "full" | "free") {
  const dir = episodeFile(episode, "");
  const candidates = fs
    .readdirSync(dir)
    .filter((name) => new RegExp(`^${kind}(-audio)?\\.(mp4|mov|m4a|wav|mp3|aac)$`).test(name))
    // Prefer Descript's audio-only render over pulling audio out of the video.
    .sort((a, b) => Number(b.includes("-audio")) - Number(a.includes("-audio")));

  return candidates[0] ? episodeFile(episode, candidates[0]) : undefined;
}

function toMp3(input: string, output: string, channels: 1 | 2, force: boolean) {
  if (fs.existsSync(output) && !force) {
    console.log(`= ${output}`);
    return;
  }

  run("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    input,
    "-vn",
    "-ac",
    String(channels),
    "-ar",
    "44100",
    "-codec:a",
    "libmp3lame",
    "-b:a",
    channels === 1 ? "96k" : "192k",
    output,
  ]);
  console.log(`+ ${output}`);
}

/**
 * SRT → WebVTT for YouTube. Descript adds a zero-length cue with the speaker label (often the raw
 * Riverside file name) at every speaker change, so drop those, and apply the episode's corrections.
 */
export function srtToVtt(srt: string, corrections: Record<string, string> = {}) {
  const cues = srt
    .replace(/\r/g, "")
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n");
      const timing = lines.find((line) => line.includes("-->"));
      const text = lines.slice(lines.indexOf(timing as string) + 1).join("\n").trim();
      return { timing, text };
    })
    .filter((cue): cue is { timing: string; text: string } => Boolean(cue.timing && cue.text))
    .filter((cue) => {
      const [start, end] = cue.timing.split(" --> ").map((time) => time.trim());
      return start !== end && !/^[^\s]+:$/.test(cue.text);
    });

  const body = cues
    .map((cue, i) => `${i + 1}\n${cue.timing.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")}\n${applyCorrections(cue.text, corrections)}`)
    .join("\n\n");

  return `WEBVTT\n\n${body}\n`;
}

function main() {
  const { positionals, flags } = parseArgs();
  const episode = requireEpisode(positionals);
  const force = Boolean(flags.force);

  if (!hasCommand("ffmpeg")) fail("ffmpeg is not installed (brew install ffmpeg).");

  const full = source(episode, "full");
  const free = source(episode, "free");
  if (!full) fail(`No full render in ${episodeFile(episode, "")}. Run \`episode:descript ${episode} publish full\`.`);
  if (!free) fail(`No free render in ${episodeFile(episode, "")}. Run \`episode:descript ${episode} publish free\`.`);

  toMp3(full, episodeFile(episode, "full-mono.mp3"), 1, force);
  toMp3(free, episodeFile(episode, "free-mono.mp3"), 1, force);

  const infoFile = episodeFile(episode, "episode.json");
  const corrections = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile, "utf8")).corrections : undefined;

  for (const kind of ["full", "free"]) {
    const srt = episodeFile(episode, `${kind}.srt`);
    if (!fs.existsSync(srt)) fail(`Missing ${srt}. Run \`episode:descript ${episode} export ${kind}\`.`);
    fs.writeFileSync(episodeFile(episode, `${kind}.vtt`), srtToVtt(fs.readFileSync(srt, "utf8"), corrections));
    console.log(`+ ${episodeFile(episode, `${kind}.vtt`)}`);
  }
}

if (require.main === module) {
  main();
}
