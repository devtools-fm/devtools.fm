/**
 * Wait for episode <N> to go live on Spotify, then print (and record) its open.spotify.com URL.
 *
 *   pnpm episode:wait-for-spotify 179 [--timeout-minutes 180] [--write]
 *
 * 1. Polls the Spotify for Podcasters RSS feed until an item has <itunes:episode>N</itunes:episode>.
 * 2. Works out the free episode's Spotify ID. If the Spotify draft was made by this pipeline,
 *    the creators.spotify.com draft URL already has it (`state.spotify.freeDraftUrl`), and the
 *    script just waits for it to be publicly playable. Otherwise it falls back to the show's
 *    embed page (newest episode). That can be the subscribers-only cut when both are published
 *    together, so it only accepts an episode that's playable without a subscription.
 * --write also sets `spotify:` in pages/episode/<N>.mdx.
 */
import { config, fail, mdxPath, parseArgs, readState, requireEpisode, run, updateState } from "./lib";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url: string) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.text();
}

function cdata(value = "") {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

export async function findFeedItem(episode: string) {
  const xml = await fetchText(config.spotify.rssUrl);
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const number = item.match(/<itunes:episode>(\d+)<\/itunes:episode>/)?.[1];
    if (number === episode) {
      return {
        title: cdata(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]),
        link: cdata(item.match(/<link>([\s\S]*?)<\/link>/)?.[1]),
      };
    }
  }
  return undefined;
}

export async function latestSpotifyEpisode() {
  const showId = config.spotify.showUrl.split("/show/")[1]?.split("?")[0];
  const html = await fetchText(`https://open.spotify.com/embed/show/${showId}`);
  const data = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  const entity = data && JSON.parse(data)?.props?.pageProps?.state?.data?.entity;
  if (!entity?.uri?.startsWith("spotify:episode:")) return undefined;
  return { title: String(entity.title || entity.name), url: `https://open.spotify.com/episode/${entity.uri.split(":").pop()}` };
}

/** Whether an episode plays for everyone. Subscriber-only episodes embed with isPlayable:false. */
export async function isPubliclyPlayable(url: string) {
  const id = url.split("/episode/")[1]?.split("?")[0];
  const html = await fetchText(`https://open.spotify.com/embed/episode/${id}`);
  return /"isPlayable":true/.test(html);
}

async function main() {
  const { positionals, flags } = parseArgs();
  const episode = requireEpisode(positionals);
  const deadline = Date.now() + (Number(flags["timeout-minutes"]) || 180) * 60_000;
  let item: Awaited<ReturnType<typeof findFeedItem>>;

  while (!(item = await findFeedItem(episode).catch(() => undefined))) {
    if (Date.now() > deadline) fail(`Episode ${episode} never showed up in ${config.spotify.rssUrl}.`);
    console.error(`  … ${episode} not in the feed yet`);
    await sleep(60_000);
  }
  console.error(`  … in the feed: "${item.title}" (${item.link})`);

  // The draft URL from creators.spotify.com uses the same ID as open.spotify.com.
  const draftId = readState(episode).spotify?.freeDraftUrl?.match(/\/episode\/([A-Za-z0-9]+)/)?.[1];

  for (;;) {
    const latest = draftId
      ? { title: item.title, url: `https://open.spotify.com/episode/${draftId}` }
      : await latestSpotifyEpisode().catch(() => undefined);
    const playable = latest ? await isPubliclyPlayable(latest.url).catch(() => false) : false;
    if (latest && playable && latest.title.trim().toLowerCase() === item.title.toLowerCase()) {
      updateState(episode, (state) => (state.spotify = { ...state.spotify, publicUrl: latest.url }));
      if (flags.write) {
        run("node", ["-r", "esbuild-register", "scripts/publish/episode-mdx.ts", episode, "set", "spotify", latest.url]);
        console.error(`  … wrote spotify: to ${mdxPath(episode)}`);
      }
      console.log(latest.url);
      return;
    }
    if (Date.now() > deadline) {
      fail(`Spotify's newest episode is "${latest?.title}", not "${item.title}". Grab the link from ${item.link} instead.`);
    }
    console.error(`  … Spotify hasn't picked it up yet (${latest ? `${latest.url} playable=${playable}` : "no episode found"})`);
    await sleep(120_000);
  }
}

main().catch((error) => fail(error.message));
