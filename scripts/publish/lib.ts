import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { loadEnvFile } from "utils/loadEnvFile";

loadEnvFile();

export const ROOT = process.cwd();
export const EPISODE_DIR = path.join(ROOT, "pages", "episode");

/** `main` is the editor's handoff composition; it becomes Full, and Free is split from it. */
export type CompositionKind = "main" | "full" | "free";

export type PublishConfig = {
  github: { repo: string };
  descript: {
    apiBase: string;
    projectName: string;
    compositionNames: Record<"full" | "free", string>;
    assets: {
      dir: string;
      bedVolumeDb: number;
      intro: { frame: string; music: string; seconds: number; tailSeconds: number };
      outro: { frame: string; music: string; seconds: number };
    };
    hosts: { name: string; speaker: string; card: string }[];
    videoResolution: string;
    adAfterMinutes: number;
    nameCard: {
      folder: string;
      position: string;
      heightPercentOfFrame: number;
      insetPercentOfFrame: number;
      fadeSeconds: number;
      mainConversationSeconds: number;
    };
  };
  website: { baseUrl: string };
  youtube: {
    channelId: string;
    categoryId: string;
    defaultLanguage: string;
    baseTags: string[];
    freeFooter: string[];
    paidFooter: string[];
  };
  spotify: { rssUrl: string; dashboardUrl: string; showUrl: string };
  patreon: { creatorUrl: string; postUrl: string };
  browser: { profile: string; cdpPort: number };
  art: {
    displayFont: string;
    displayFamily: string;
    monoFont: string;
    monoFamily: string;
    chromePath: string;
  };
};

export const config: PublishConfig = JSON.parse(
  fs.readFileSync(path.join(ROOT, "publish.config.json"), "utf8")
);

export function browserProfileDir() {
  return config.browser.profile.replace(/^~(?=\/)/, os.homedir());
}

/** agent-browser args that attach to the devtools.fm Chrome started by `pnpm episode:browser`. */
export function browserArgs() {
  return ["--cdp", String(config.browser.cdpPort)];
}

/** Everything the pipeline produces for an episode lives here (gitignored). */
export function episodeDir(episode: string) {
  const dir = path.join(ROOT, ".generated", "publish", episode);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function episodeFile(episode: string, name: string) {
  return path.join(episodeDir(episode), name);
}

export function mdxPath(episode: string) {
  return path.join(EPISODE_DIR, `${episode}.mdx`);
}

export function episodeUrl(episode: string) {
  return `${config.website.baseUrl}/episode/${episode}`;
}

export type StepStatus = "done" | "manual" | "skipped" | "failed";

export type EpisodeState = {
  episode: string;
  descript?: {
    projectId?: string;
    projectUrl?: string;
    compositions?: Partial<Record<CompositionKind, { id: string; name: string }>>;
    conversationId?: string;
    publishes?: Partial<
      Record<
        string,
        { jobId: string; shareUrl?: string; downloadUrl?: string; file?: string }
      >
    >;
  };
  youtube?: Partial<Record<"free" | "paid", { videoId: string; url: string }>>;
  spotify?: { freeDraftUrl?: string; paidDraftUrl?: string; publicUrl?: string };
  patreon?: { videoPostUrl?: string; audioPostUrl?: string };
  issue?: { number: number; url: string };
  steps: Record<string, { status: StepStatus; at: string; note?: string }>;
};

function statePath(episode: string) {
  return episodeFile(episode, "state.json");
}

export function readState(episode: string): EpisodeState {
  const file = statePath(episode);

  if (!fs.existsSync(file)) {
    return { episode, steps: {} };
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeState(state: EpisodeState) {
  fs.writeFileSync(statePath(state.episode), `${JSON.stringify(state, null, 2)}\n`);
}

export function updateState(episode: string, fn: (state: EpisodeState) => void) {
  const state = readState(episode);
  fn(state);
  writeState(state);
  return state;
}

export function markStep(episode: string, step: string, status: StepStatus, note?: string) {
  return updateState(episode, (state) => {
    state.steps[step] = { status, at: new Date().toISOString(), ...(note ? { note } : {}) };
  });
}

export function isStepDone(episode: string, step: string) {
  return readState(episode).steps[step]?.status === "done";
}

/** Minimal flag parser: positionals plus `--key value` / `--flag`. */
export function parseArgs(argv = process.argv.slice(2)) {
  const positionals: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];

      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags };
}

export function requireEpisode(positionals: string[]) {
  const episode = positionals.find((arg) => /^\d+$/.test(arg));

  if (!episode) {
    fail("Pass the episode number, e.g. `179`.");
  }

  return episode as string;
}

export function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

export function run(command: string, args: string[], options: { input?: string } = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["pipe", "pipe", "inherit"],
  });
}

export function hasCommand(command: string) {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function download(url: string, destination: string) {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  const { Readable } = await import("stream");
  const { pipeline } = await import("stream/promises");
  await pipeline(Readable.fromWeb(response.body as any), fs.createWriteStream(destination));
  return destination;
}

/** `[00:15:55] Ad` lines → seconds + title. Accepts `mm:ss` too. */
export function parseSectionsFile(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim().match(/^\[?((?:\d+:)?\d{1,2}:\d{2})\]?\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map(([, time, title]) => ({ time: normalizeTimestamp(time), seconds: toSeconds(time), title: title.trim() }));
}

export function toSeconds(time: string) {
  return time
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

export function normalizeTimestamp(time: string) {
  const seconds = Math.floor(toSeconds(time));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
}
