/**
 * Descript REST API (https://descriptapi.com/v1). Needs DESCRIPT_TOKEN in .env,
 * created under Descript → Settings → API tokens for the devtools.fm drive.
 *
 *   pnpm episode:descript find "Bobby"                      # search the drive for projects
 *   pnpm episode:descript 179 use [project id or URL]       # pin the project (default: the one named "179")
 *   pnpm episode:descript 179 project                       # list its compositions
 *   pnpm episode:descript 179 compositions [--main <id>] [--full <id>] [--free <id>]
 *   pnpm episode:descript 179 agent --prompt-file p.md [--composition main|full|free] [--new-conversation]
 *   pnpm episode:descript 179 publish full|free [--audio]   # render + download
 *   pnpm episode:descript 179 export full|free              # srt, txt, markdown transcripts
 *   pnpm episode:descript 179 import <file> [--as "Name Cards/Bobby Grayson.png"]   # direct upload into the project
 *   pnpm episode:descript 179 clips [--match "^s\\d+$"]       # render the editor's social clips + transcripts
 *   pnpm episode:descript 179 brand                         # upload intro/outro files + host cards the project is missing
 */
import fs from "fs";
import path from "path";

import {
  type CompositionKind,
  config,
  download,
  episodeFile,
  fail,
  ROOT,
  parseArgs,
  readState,
  updateState,
} from "./lib";

type Job = {
  job_id: string;
  job_type: string;
  job_state: "queued" | "running" | "stopped" | "cancelled";
  project_url?: string;
  progress?: { label: string; percent?: number };
  result?: Record<string, any> & { status: string; error_message?: string };
};

type Project = {
  id: string;
  name: string;
  compositions: { id: string; name: string; duration?: number; media_type?: string }[];
  publishes: { share_url: string; composition_id: string; media_type: string; name: string }[];
};

function token() {
  const value = process.env.DESCRIPT_TOKEN || process.env.DESCRIPT_API_TOKEN;
  if (!value) fail("DESCRIPT_TOKEN is not set. Create one in Descript → Settings → API tokens and add it to .env.");
  return value;
}

export async function descript<T = any>(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  body?: Record<string, unknown>,
  raw = false
): Promise<T> {
  const response = await fetch(`${config.descript.apiBase}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Descript ${method} ${endpoint} → ${response.status}: ${await response.text()}`);
  }

  return (raw ? response.text() : response.json()) as Promise<T>;
}

export async function waitForJob(jobId: string, { intervalMs = 10_000 } = {}) {
  let lastLabel = "";

  for (;;) {
    const job = await descript<Job>("GET", `/jobs/${jobId}`);
    const label = job.progress ? `${job.progress.label}${job.progress.percent != null ? ` ${job.progress.percent}%` : ""}` : job.job_state;

    if (label !== lastLabel) {
      console.error(`  … ${job.job_type}: ${label}`);
      lastLabel = label;
    }

    if (job.job_state === "stopped" || job.job_state === "cancelled") {
      if (job.job_state === "cancelled" || job.result?.status === "error") {
        throw new Error(`Descript job ${jobId} ${job.job_state}: ${job.result?.error_message || "no details"}`);
      }
      return job;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

function projectIdFrom(value: string) {
  const uuid = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (!uuid) fail(`Couldn't find a project ID in "${value}".`);
  return uuid[0];
}

function requireProject(episode: string) {
  const projectId = readState(episode).descript?.projectId;
  if (!projectId) fail(`No Descript project pinned for ${episode}. Run \`pnpm episode:descript ${episode} use <project>\` first.`);
  return projectId;
}

function requireComposition(episode: string, kind: CompositionKind) {
  const composition = readState(episode).descript?.compositions?.[kind];
  if (!composition) {
    fail(
      `No "${kind}" composition recorded. Run \`pnpm episode:descript ${episode} project\` to list them, then \`compositions --${kind} <id>\`.`
    );
  }
  return composition;
}

/** "178 -  Free" and "178 - free" are the same name. */
const sameName = (a: string, b: string) => a.replace(/\s+/g, " ").trim().toLowerCase() === b.replace(/\s+/g, " ").trim().toLowerCase();
export const nameFor = (template: string, episode: string) => template.replace(/\{N\}/g, episode);

/**
 * Match compositions by the names in publish.config.json. Before the split, `main` is the
 * editor's composition: the one already named after the episode, or else the longest one
 * (the clips and s1–s4 shorts are all a minute or two).
 */
function detectCompositions(project: Project, episode: string) {
  const found: Partial<Record<CompositionKind, { id: string; name: string }>> = {};

  for (const kind of ["full", "free"] as const) {
    const wanted = nameFor(config.descript.compositionNames[kind], episode);
    const match = project.compositions.find((c) => sameName(c.name, wanted));
    if (match) found[kind] = { id: match.id, name: match.name };
  }

  const longest = [...project.compositions].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];
  const main = found.full || (longest && { id: longest.id, name: longest.name });
  if (main) found.main = main;

  return found;
}

async function findProjectByEpisode(episode: string) {
  const wanted = nameFor(config.descript.projectName, episode);
  const { results } = await descript<{ results: { type: string; project_id: string; name: string }[] }>(
    "GET",
    `/search?${new URLSearchParams({ query: wanted, type: "project", sort: "newest", limit: "25" })}`
  );
  const matches = results.filter((result) => result.type === "project" && sameName(result.name, wanted));
  if (matches.length !== 1) {
    fail(`Expected one Descript project named "${wanted}", found ${matches.length}. Pass its URL: \`episode:descript ${episode} use <url>\`.`);
  }
  return matches[0].project_id;
}

async function showProject(episode: string) {
  const project = await descript<Project>("GET", `/projects/${requireProject(episode)}`);
  const detected = detectCompositions(project, episode);

  updateState(episode, (state) => {
    state.descript = {
      ...state.descript,
      // Names win over earlier picks, so Full/Free are found once the split exists.
      compositions: { ...state.descript?.compositions, ...detected },
    };
  });

  console.log(`${project.name}  (${project.id})`);
  for (const composition of project.compositions) {
    const minutes = composition.duration ? ` ${(composition.duration / 60).toFixed(1)} min` : "";
    console.log(`  - ${composition.name}  [${composition.id}]${minutes}`);
  }
  console.log(`Recorded: ${JSON.stringify(readState(episode).descript?.compositions || {})}`);
}

async function runAgent(episode: string, prompt: string, kind?: CompositionKind, newConversation = false) {
  const state = readState(episode);
  const job = await descript<{ job_id: string; conversation_id: string; project_url: string }>("POST", "/jobs/agent", {
    project_id: requireProject(episode),
    ...(kind ? { composition_id: requireComposition(episode, kind).id } : {}),
    ...(state.descript?.conversationId && !newConversation ? { conversation_id: state.descript.conversationId } : {}),
    prompt,
  });

  updateState(episode, (s) => {
    s.descript = { ...s.descript, conversationId: job.conversation_id, projectUrl: job.project_url };
  });

  const done = await waitForJob(job.job_id);
  const transcriptFile = episodeFile(episode, "underlord.log.md");
  fs.appendFileSync(
    transcriptFile,
    `\n## ${new Date().toISOString()}${kind ? ` (${kind})` : ""}\n\n**Prompt:** ${prompt}\n\n**Underlord:** ${done.result?.agent_response}\n`
  );

  console.log(done.result?.agent_response || "(no response)");
  console.log(`\nproject_changed: ${done.result?.project_changed}  ·  ${job.project_url}`);
}

async function publish(episode: string, kind: CompositionKind, audio: boolean) {
  const composition = requireComposition(episode, kind);
  const mediaType = audio ? "Audio" : "Video";
  const job = await descript<{ job_id: string }>("POST", "/jobs/publish", {
    project_id: requireProject(episode),
    composition_id: composition.id,
    media_type: mediaType,
    ...(audio ? {} : { resolution: config.descript.videoResolution }),
    access_level: "unlisted",
  });

  const done = await waitForJob(job.job_id, { intervalMs: 15_000 });
  const shareUrl: string | undefined = done.result?.share_url;
  const downloadUrl: string | undefined = done.result?.download_url;
  if (!downloadUrl) throw new Error("Publish finished without a download_url.");

  const extension = path.extname(new URL(downloadUrl).pathname) || (audio ? ".wav" : ".mp4");
  const file = episodeFile(episode, `${kind}${audio ? "-audio" : ""}${extension}`);
  console.error(`  … downloading to ${file}`);
  await download(downloadUrl, file);

  updateState(episode, (state) => {
    state.descript = {
      ...state.descript,
      publishes: {
        ...state.descript?.publishes,
        [`${kind}-${mediaType.toLowerCase()}`]: { jobId: job.job_id, shareUrl, downloadUrl, file },
      },
    };
  });

  console.log(file);
  console.log(shareUrl);
}

async function exportTranscripts(episode: string, kind: CompositionKind) {
  const base = { project_id: requireProject(episode), composition_id: requireComposition(episode, kind).id };
  const outputs: [string, Record<string, unknown>][] = [
    [`${kind}.srt`, { format: "srt" }],
    [`${kind}.txt`, { format: "txt", include_speaker_labels: "changes" }],
    // Speaker-change timecodes let build-mdx slot section headings in the right place.
    [
      `${kind}.transcript.md`,
      { format: "markdown", include_speaker_labels: "changes", timecodes: { on_speakers: true, on_paragraphs: true } },
    ],
    // Markers only, used to read back the chapter list.
    [`${kind}.markers.md`, { format: "markdown", include_speaker_labels: "off", include_markers: true, timecodes: { on_markers: true } }],
  ];

  for (const [name, options] of outputs) {
    const text = await descript<string>("POST", "/export/transcript", { ...base, ...options }, true);
    const file = episodeFile(episode, name);
    fs.writeFileSync(file, text);
    console.log(file);
  }
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
};

/** Direct upload: ask for a signed URL, PUT the bytes, wait for Descript to process it. */
async function importFile(episode: string, file: string, as?: string) {
  if (!fs.existsSync(file)) fail(`No such file: ${file}`);
  const contentType = MIME[path.extname(file).toLowerCase()];
  if (!contentType) fail(`Don't know the MIME type for ${file}.`);

  const name = as || path.basename(file);
  const bytes = fs.readFileSync(file);
  const job = await descript<{ job_id: string; upload_urls?: Record<string, { upload_url: string }> }>(
    "POST",
    "/jobs/import/project_media",
    { project_id: requireProject(episode), add_media: { [name]: { content_type: contentType, file_size: bytes.length } } }
  );

  const uploadUrl = job.upload_urls?.[name]?.upload_url;
  if (!uploadUrl) throw new Error(`Descript didn't return an upload URL for ${name}.`);

  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: bytes });
  if (!put.ok) throw new Error(`Upload failed (${put.status}): ${await put.text()}`);

  await waitForJob(job.job_id, { intervalMs: 5_000 });
  console.log(`Imported ${name}`);
}

/** Upload the intro/outro files and host cards from assets/descript/ unless the project already has them. */
async function importBrand(episode: string) {
  const project = await descript<Project & { media_files: Record<string, unknown> }>("GET", `/projects/${requireProject(episode)}`);
  const have = new Set(Object.keys(project.media_files).map((name) => path.basename(name)));
  const { dir, intro, outro } = config.descript.assets;
  const wanted = [...new Set([intro.frame, intro.music, outro.frame, outro.music, ...config.descript.hosts.map((host) => host.card)])];

  for (const name of wanted) {
    if (have.has(name)) {
      console.log(`= ${name} (already in project)`);
      continue;
    }
    const file = path.join(ROOT, dir, name);
    if (!fs.existsSync(file)) fail(`Missing ${file}. Export it from an earlier project into ${dir}/.`);
    await importFile(episode, file, name);
  }
}

/**
 * The editor's social clips: short compositions named s1, s2, … Render each as video and export
 * its transcript into .generated/publish/<N>/clips/ for the Buffer posts.
 */
async function exportClips(episode: string, pattern: RegExp) {
  const project = await descript<Project>("GET", `/projects/${requireProject(episode)}`);
  const clips = project.compositions.filter((c) => pattern.test(c.name.trim()));
  if (!clips.length) fail(`No compositions matching ${pattern} in ${project.name}.`);

  const dir = episodeFile(episode, "clips");
  fs.mkdirSync(dir, { recursive: true });

  // Rendering runs on Descript's side, so start every job at once and wait for them together.
  const jobs = await Promise.all(
    clips.map(async (clip) => {
      const job = await descript<{ job_id: string }>("POST", "/jobs/publish", {
        project_id: project.id,
        composition_id: clip.id,
        media_type: "Video",
        resolution: config.descript.videoResolution,
        access_level: "unlisted",
      });
      return { clip, jobId: job.job_id };
    })
  );

  for (const { clip, jobId } of jobs) {
    const name = clip.name.trim().replace(/[^\w-]+/g, "-");
    const done = await waitForJob(jobId, { intervalMs: 10_000 });
    const downloadUrl: string | undefined = done.result?.download_url;
    if (!downloadUrl) throw new Error(`Clip ${clip.name} finished without a download_url.`);
    await download(downloadUrl, path.join(dir, `${name}.mp4`));

    const text = await descript<string>(
      "POST",
      "/export/transcript",
      { project_id: project.id, composition_id: clip.id, format: "txt", include_speaker_labels: "changes" },
      true
    );
    fs.writeFileSync(path.join(dir, `${name}.txt`), text);
    console.log(`${clip.name}: ${path.join(dir, `${name}.mp4`)} (${((clip.duration || 0)).toFixed(0)}s)`);
  }
}

async function main() {
  const { positionals, flags } = parseArgs();

  if (positionals[0] === "find") {
    const query = positionals.slice(1).join(" ");
    const { results } = await descript<{ results: any[] }>(
      "GET",
      `/search?${new URLSearchParams({ query, type: "project", sort: "newest", limit: "10" })}`
    );
    for (const result of results) {
      console.log(`${result.updated_at?.slice(0, 10)}  ${result.name}  ${result.url}`);
    }
    return;
  }

  if (positionals[0] === "job") {
    console.log(JSON.stringify(await descript("GET", `/jobs/${positionals[1]}`), null, 2));
    return;
  }

  const [episode, command, arg] = positionals;
  if (!episode || !/^\d+$/.test(episode)) fail("Usage: episode:descript <episode> <command> …");

  switch (command) {
    case "use": {
      const projectId = arg ? projectIdFrom(arg) : await findProjectByEpisode(episode);
      updateState(episode, (state) => {
        state.descript = { ...state.descript, projectId, conversationId: undefined };
      });
      await showProject(episode);
      break;
    }
    case "project":
      await showProject(episode);
      break;
    case "compositions": {
      const project = await descript<Project>("GET", `/projects/${requireProject(episode)}`);
      updateState(episode, (state) => {
        const compositions = { ...state.descript?.compositions };
        for (const kind of ["main", "full", "free"] as CompositionKind[]) {
          const id = flags[kind];
          if (typeof id !== "string") continue;
          const match = project.compositions.find((c) => c.id === id || c.id.startsWith(id));
          if (!match) fail(`No composition ${id} in ${project.name}.`);
          compositions[kind] = { id: match.id, name: match.name };
        }
        state.descript = { ...state.descript, compositions };
      });
      console.log(JSON.stringify(readState(episode).descript?.compositions, null, 2));
      break;
    }
    case "agent": {
      const prompt =
        typeof flags["prompt-file"] === "string"
          ? fs.readFileSync(flags["prompt-file"], "utf8")
          : typeof flags.prompt === "string"
            ? flags.prompt
            : fail("Pass --prompt or --prompt-file.");
      const kind = typeof flags.composition === "string" ? (flags.composition as CompositionKind) : undefined;
      await runAgent(episode, prompt, kind, Boolean(flags["new-conversation"]));
      break;
    }
    case "publish":
      if (arg !== "full" && arg !== "free") fail("publish needs full or free.");
      await publish(episode, arg, Boolean(flags.audio));
      break;
    case "export":
      if (arg !== "full" && arg !== "free") fail("export needs full or free.");
      await exportTranscripts(episode, arg);
      break;
    case "clips":
      await exportClips(episode, new RegExp(typeof flags.match === "string" ? flags.match : "^s\\d+$", "i"));
      break;
    case "brand":
      await importBrand(episode);
      break;
    case "import":
      await importFile(episode, path.resolve(arg || ""), typeof flags.as === "string" ? flags.as : undefined);
      break;
    default:
      fail(`Unknown command "${command}".`);
  }
}

if (require.main === module) {
  main().catch((error) => fail(error.message));
}
