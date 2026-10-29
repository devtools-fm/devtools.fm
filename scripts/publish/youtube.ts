/**
 * YouTube Data API v3.
 *
 *   pnpm episode:youtube auth                                  # one-time OAuth in the browser
 *   pnpm episode:youtube 179 upload free|paid [--force]         # private upload + thumbnail + captions
 *   pnpm episode:youtube 179 update free|paid                   # re-push title/description/tags
 *   pnpm episode:youtube 179 adopt free|paid <videoId>          # finish an upload whose process died
 *   pnpm episode:youtube 179 publish free                   # make it public (after the go-live approval)
 *   pnpm episode:youtube 179 status
 *
 * Setup: create an OAuth client ("Desktop app") in Google Cloud with the YouTube Data API
 * enabled, download its JSON to ~/.config/devtools-fm/youtube-client.json, then run `auth`.
 *
 * The paid upload is never made public through the API: members-only visibility can only be
 * set in YouTube Studio.
 */
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";

import { google, youtube_v3 } from "googleapis";

import { config, episodeFile, fail, parseArgs, readState, run, updateState } from "./lib";

const CONFIG_DIR = path.join(os.homedir(), ".config", "devtools-fm");
const CLIENT_FILE = path.join(CONFIG_DIR, "youtube-client.json");
const TOKEN_FILE = path.join(CONFIG_DIR, "youtube-token.json");
const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube.upload"];
const THUMBNAIL_LIMIT = 2 * 1024 * 1024;

type Kind = "free" | "paid";

function oauthClient(redirectUri = "http://127.0.0.1") {
  if (!fs.existsSync(CLIENT_FILE)) {
    fail(`Missing ${CLIENT_FILE}. Download a "Desktop app" OAuth client JSON from Google Cloud Console.`);
  }
  const { installed, web } = JSON.parse(fs.readFileSync(CLIENT_FILE, "utf8"));
  const client = installed || web;
  return new google.auth.OAuth2(client.client_id, client.client_secret, redirectUri);
}

export function youtubeClient() {
  if (!fs.existsSync(TOKEN_FILE)) fail("Not authorized with YouTube. Run `pnpm episode:youtube auth`.");
  const auth = oauthClient();
  auth.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")));
  auth.on("tokens", (tokens) => {
    const saved = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ ...saved, ...tokens }, null, 2), { mode: 0o600 });
  });
  return google.youtube({ version: "v3", auth });
}

async function authorize() {
  const server = http.createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  const auth = oauthClient(`http://127.0.0.1:${port}`);
  const url = auth.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });

  console.log(`Opening the Google consent screen. If it doesn't open, visit:\n${url}`);
  run("open", [url]);

  const code = await new Promise<string>((resolve, reject) => {
    server.on("request", (req, res) => {
      const params = new URL(req.url || "/", `http://127.0.0.1:${port}`).searchParams;
      res.end(params.get("code") ? "devtools.fm is authorized. You can close this tab." : "Authorization failed.");
      server.close();
      params.get("code") ? resolve(params.get("code") as string) : reject(new Error(params.get("error") || "no code"));
    });
  });

  const { tokens } = await auth.getToken(code);
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
  console.log(`Saved ${TOKEN_FILE}`);
}

function readCopy(episode: string, name: string) {
  const file = episodeFile(episode, name);
  if (!fs.existsSync(file)) fail(`Missing ${file}. Run \`pnpm episode:copy ${episode}\`.`);
  return fs.readFileSync(file, "utf8").trim();
}

function snippet(episode: string, kind: Kind): youtube_v3.Schema$VideoSnippet {
  return {
    title: readCopy(episode, "youtube-title.txt"),
    description: readCopy(episode, kind === "free" ? "youtube-free.txt" : "youtube-paid.txt"),
    tags: readCopy(episode, "youtube-tags.txt")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    categoryId: config.youtube.categoryId,
    defaultLanguage: config.youtube.defaultLanguage,
    defaultAudioLanguage: config.youtube.defaultLanguage,
  };
}

function videoFile(episode: string, kind: Kind) {
  // The paid video is the full (ad-free) cut.
  const file = episodeFile(episode, kind === "free" ? "free.mp4" : "full.mp4");
  if (!fs.existsSync(file)) fail(`Missing ${file}. Run \`pnpm episode:descript ${episode} publish ${kind === "free" ? "free" : "full"}\`.`);
  return file;
}

function thumbnailFile(episode: string) {
  const png = episodeFile(episode, "thumbnail.png");
  if (!fs.existsSync(png)) return undefined;
  if (fs.statSync(png).size <= THUMBNAIL_LIMIT) return png;

  // YouTube rejects thumbnails over 2MB; macOS's sips re-encodes without extra installs.
  const jpg = episodeFile(episode, "thumbnail.jpg");
  run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", png, "--out", jpg]);
  return jpg;
}

async function upload(episode: string, kind: Kind, force = false) {
  const existing = readState(episode).youtube?.[kind];
  if (existing && !force) {
    console.log(`Already uploaded: ${existing.url} (use \`update\` to change metadata)`);
    return;
  }

  const youtube = youtubeClient();
  const file = videoFile(episode, kind);
  const size = fs.statSync(file).size;
  let lastPercent = -1;

  const response = await youtube.videos.insert(
    {
      part: ["snippet", "status"],
      notifySubscribers: kind === "free",
      requestBody: {
        snippet: snippet(episode, kind),
        status: { privacyStatus: "private", selfDeclaredMadeForKids: false, embeddable: true },
      },
      media: { body: fs.createReadStream(file) },
    },
    {
      onUploadProgress: (event: { bytesRead: number }) => {
        const percent = Math.floor((event.bytesRead / size) * 100);
        if (percent % 10 === 0 && percent !== lastPercent) {
          console.error(`  … uploading ${kind}: ${percent}%`);
          lastPercent = percent;
        }
      },
    }
  );

  const videoId = response.data.id as string;
  console.log(`Uploaded ${kind} as private: https://www.youtube.com/watch?v=${videoId}`);
  await finishUpload(episode, kind, videoId);
}

/**
 * Record the video and set its thumbnail and captions. Also used by `adopt` when an upload
 * finished but the process died before these steps (the video exists on YouTube already).
 */
async function finishUpload(episode: string, kind: Kind, videoId: string) {
  const youtube = youtubeClient();
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  updateState(episode, (state) => {
    state.youtube = { ...state.youtube, [kind]: { videoId, url } };
  });

  const thumbnail = thumbnailFile(episode);
  if (thumbnail) {
    await youtube.thumbnails.set({ videoId, media: { body: fs.createReadStream(thumbnail) } });
    console.log(`Set thumbnail from ${path.basename(thumbnail)}`);
  } else {
    console.warn("! No thumbnail.png yet. Run `pnpm episode:art` and then `update` to set it.");
  }

  const vtt = episodeFile(episode, kind === "free" ? "free.vtt" : "full.vtt");
  if (fs.existsSync(vtt)) {
    await youtube.captions.insert({
      part: ["snippet"],
      requestBody: { snippet: { videoId, language: config.youtube.defaultLanguage, name: "English", isDraft: false } },
      media: { mimeType: "text/vtt", body: fs.createReadStream(vtt) },
    });
    console.log(`Uploaded captions from ${path.basename(vtt)}`);
  } else {
    console.warn(`! Missing ${vtt}; captions not uploaded.`);
  }
}

function requireVideo(episode: string, kind: Kind) {
  const video = readState(episode).youtube?.[kind];
  if (!video) fail(`No ${kind} video recorded. Run \`pnpm episode:youtube ${episode} upload ${kind}\`.`);
  return video;
}

async function update(episode: string, kind: Kind) {
  const youtube = youtubeClient();
  const { videoId, url } = requireVideo(episode, kind);
  await youtube.videos.update({ part: ["snippet"], requestBody: { id: videoId, snippet: snippet(episode, kind) } });

  const thumbnail = thumbnailFile(episode);
  if (thumbnail) await youtube.thumbnails.set({ videoId, media: { body: fs.createReadStream(thumbnail) } });
  console.log(`Updated ${url}`);
}

/** Make the free video public. Runs only after the go-live approval. */
async function publish(episode: string, kind: Kind) {
  if (kind === "paid") {
    fail("The paid video goes live as members-only in YouTube Studio, since the API can't set that. See references/youtube-studio.md.");
  }

  const { videoId, url } = requireVideo(episode, kind);
  await youtubeClient().videos.update({
    part: ["status"],
    requestBody: { id: videoId, status: { privacyStatus: "public", selfDeclaredMadeForKids: false, embeddable: true } },
  });
  console.log(`${url} is public`);
}

async function status(episode: string) {
  const videos = readState(episode).youtube || {};
  const ids = Object.values(videos).map((video) => video!.videoId);
  if (!ids.length) return console.log("No videos uploaded yet.");

  const { data } = await youtubeClient().videos.list({ part: ["status", "snippet", "processingDetails"], id: ids });
  for (const item of data.items || []) {
    console.log(
      `${item.snippet?.title} → ${item.status?.privacyStatus}${item.status?.publishAt ? ` (publishAt ${item.status.publishAt})` : ""}, processing ${
        item.processingDetails?.processingStatus || "?"
      }: https://www.youtube.com/watch?v=${item.id}`
    );
  }
}

async function main() {
  const { positionals, flags } = parseArgs();

  if (positionals[0] === "auth") return authorize();

  const [episode, command, kind] = positionals as [string, string, Kind];
  if (!/^\d+$/.test(episode || "")) fail("Usage: episode:youtube <episode> <command> [free|paid]");
  if (command !== "status" && kind !== "free" && kind !== "paid") fail(`${command} needs free or paid.`);

  switch (command) {
    case "upload":
      // --force re-uploads, e.g. when an earlier upload was cut off and never processes.
      return upload(episode, kind, Boolean(flags.force));
    case "adopt":
      if (!positionals[3]) fail("Usage: adopt <episode> free|paid <videoId>");
      return finishUpload(episode, kind, positionals[3]);
    case "update":
      return update(episode, kind);
    case "publish":
      return publish(episode, kind);
    case "status":
      return status(episode);
    default:
      fail(`Unknown command "${command}".`);
  }
}

if (require.main === module) {
  main().catch((error) => fail(error?.response?.data?.error?.message || error.message));
}
