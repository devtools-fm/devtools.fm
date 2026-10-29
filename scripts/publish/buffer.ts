/**
 * Schedule the editor's social clips on every Buffer channel through Buffer's GraphQL API.
 *
 *   pnpm episode:buffer 179 [--dry-run] [--only s2] [--network twitter]
 *
 * Needs BUFFER_API_KEY in .env (publish.buffer.com/settings/api). Reads
 * .generated/publish/<N>/social.json: one post per clip, `{guest}` replaced per network.
 *
 * Buffer fetches media from a public URL when the post goes out, and there's no upload endpoint.
 * So clips must be committed to the site first: public/clips/<N>/sN.mp4, served at
 * https://www.devtools.fm/clips/<N>/sN.mp4. Use the www host, because the apex domain redirects.
 *
 * Schedule: clip i goes out on the i-th weekday from `schedule.start` (default: today) at
 * `schedule.time` (default 9:00am) in the channel's time zone. Posts already scheduled on a
 * channel with the same opening text are skipped, so re-running is safe.
 */
import fs from "fs";

import { config, episodeFile, fail, parseArgs, requireEpisode } from "./lib";

const API = "https://api.buffer.com";

type Network = "twitter" | "bluesky" | "threads" | "mastodon" | "linkedin" | "instagram" | "tiktok" | "youtube";
type Channel = { network: Network; id: string; limit: number; threadLinks: boolean };

type Social = {
  guest: { name: string; handles: Partial<Record<Network | "x", string>> };
  links: { youtube: string; spotify: string | null };
  posts: { clip: string; text: string; youtubeTitle: string }[];
  threadReply: string;
  schedule?: { start?: string; time?: string; timeZone?: string };
};

async function gql<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const key = process.env.BUFFER_API_KEY;
  if (!key) fail("BUFFER_API_KEY is not set (publish.buffer.com/settings/api).");
  const response = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors.map((e: any) => e.message).join("; "));
  return json.data;
}

/** `2026-10-20` at `9:00` in `timeZone` → UTC ISO string. */
function zoned(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(guess)
      .map((p) => [p.type, p.value])
  );
  const asZoned = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess.getTime() - (asZoned - guess.getTime())).toISOString();
}

/** The first `count` weekdays starting at `start` (inclusive), as YYYY-MM-DD. */
function weekdays(start: string, count: number) {
  const days: string[] = [];
  const d = new Date(`${start}T12:00:00Z`);
  while (days.length < count) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

function todayIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

function guestFor(social: Social, network: Network) {
  const handles = social.guest.handles;
  return handles[network] || (network === "twitter" || (network as string) === "x" ? handles.x || handles.twitter : undefined) || social.guest.name;
}

/** createPost input for one clip on one channel. */
export function buildInput(social: Social, channel: Channel, index: number, dueAt: string) {
  const post = social.posts[index];
  const text = post.text.replace(/\{guest\}/g, guestFor(social, channel.network));
  const reply = social.threadReply.replace("{youtube}", social.links.youtube).replace("{spotify}", social.links.spotify || "");
  const video = { video: { url: `${config.website.baseUrl.replace("://", "://www.")}/clips/${episodeOf(social)}/s${index + 1}.mp4` } };
  const base = { channelId: channel.id, schedulingType: "automatic", mode: "customScheduled", dueAt, assets: [video] };

  if (text.length > channel.limit) throw new Error(`${channel.network} post ${index + 1} is ${text.length} chars (limit ${channel.limit}).`);

  if (channel.threadLinks) {
    // Buffer's metadata key for X is still `twitter`.
    const key = (channel.network as string) === "x" ? "twitter" : channel.network;
    return { ...base, text, metadata: { [key]: { thread: [{ text, assets: [video] }, { text: reply }] } } };
  }

  switch (channel.network) {
    case "linkedin":
      return { ...base, text: `${text}\n\n${reply}` };
    case "youtube":
      return {
        ...base,
        text: `${text}\n\n${reply}`,
        metadata: { youtube: { title: post.youtubeTitle.slice(0, 100), categoryId: config.youtube.categoryId, privacy: "public", madeForKids: false, notifySubscribers: true } },
      };
    case "instagram":
      // Links aren't clickable in Instagram captions.
      return { ...base, text: `${text}\n\nFull episode out now on YouTube and Spotify.`, metadata: { instagram: { type: "reel", shouldShareToFeed: true } } };
    case "tiktok":
      return { ...base, text: `${text}\n\nFull episode out now on YouTube and Spotify.`, metadata: { tiktok: { title: post.youtubeTitle } } };
    default:
      throw new Error(`No rules for ${channel.network}.`);
  }
}

let currentEpisode = "";
const episodeOf = (_: Social) => currentEpisode;

async function scheduledTexts(organizationId: string) {
  const data = await gql(
    `query($org: OrganizationId!) { posts(input: { organizationId: $org, filter: { status: [scheduled] } }, first: 100) { edges { node { channelId text dueAt } } } }`,
    { org: organizationId }
  );
  return data.posts.edges.map((e: any) => e.node) as { channelId: string; text: string; dueAt: string }[];
}

async function main() {
  const { positionals, flags } = parseArgs();
  const episode = requireEpisode(positionals);
  currentEpisode = episode;
  const social: Social = JSON.parse(fs.readFileSync(episodeFile(episode, "social.json"), "utf8"));
  if (!social.links.spotify) fail("social.json has no Spotify link yet. Run after `episode:wait-for-spotify`.");

  const channels = (config as any).buffer.channels as Channel[];
  const { account } = await gql(`{ account { organizations { id } } }`);
  const org = account.organizations[0].id;
  const existing = await scheduledTexts(org);

  const timeZone = social.schedule?.timeZone || "America/Los_Angeles";
  const days = weekdays(social.schedule?.start || todayIn(timeZone), social.posts.length);
  const time = social.schedule?.time || "9:00";
  const onlyClip = typeof flags.only === "string" ? Number(flags.only.replace(/\D/g, "")) - 1 : undefined;
  const onlyNetwork = typeof flags.network === "string" ? flags.network : undefined;

  for (const [index, post] of social.posts.entries()) {
    if (onlyClip !== undefined && index !== onlyClip) continue;
    const dueAt = zoned(days[index], time, timeZone);
    const due = new Date(dueAt) < new Date() ? new Date(Date.now() + 15 * 60_000).toISOString() : dueAt;

    for (const channel of channels) {
      if (onlyNetwork && channel.network !== onlyNetwork) continue;
      const opening = post.text.replace(/\{guest\}.*/, "").trim().slice(0, 50);
      const dupe = existing.find((p) => p.channelId === channel.id && (p.text || "").startsWith(opening));
      const label = `s${index + 1} ${channel.network.padEnd(9)}`;
      if (dupe) {
        console.log(`= ${label} already scheduled for ${dupe.dueAt}`);
        continue;
      }

      const input = buildInput(social, channel, index, due);
      if (flags["dry-run"]) {
        console.log(`~ ${label} ${due}\n${JSON.stringify(input, null, 2)}`);
        continue;
      }

      const result = await gql(
        `mutation($input: CreatePostInput!) { createPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`,
        { input }
      );
      const r = result.createPost;
      if (r.post) console.log(`+ ${label} ${r.post.dueAt}  (${r.post.id})`);
      else console.log(`✖ ${label} ${r.message || r.__typename}`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => fail(error.message));
}
