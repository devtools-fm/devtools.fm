# Buffer (social clip posts)

Channels and per-network rules are in `publish.config.json` → `buffer.channels`:

| Network | Character limit | Where the links go |
|---|---|---|
| X | 280 | Thread reply |
| Bluesky | 300 | Thread reply |
| Threads | 500 | Thread reply |
| Mastodon | 500 | Thread reply |
| LinkedIn | — | Appended to the post |
| Instagram | — | Appended to the post (not clickable there) |
| TikTok | — | Appended to the post (not clickable there) |
| YouTube Shorts | — | Appended; also needs a title of 100 characters or fewer, `youtubeTitle` in `social.json` |

The posts themselves are in `.generated/publish/<N>/social.json`. There's one per editor clip, with `{guest}` standing in for the guest's handle on each network, or their name where they have no account.

## Clips

- `pnpm episode:descript <N> clips` renders the s1–s4 compositions.
- Re-encode them for upload limits. The renders are 130–165 MB, and Bluesky's limit is 100 MB:

  ```bash
  ffmpeg -i sN.mp4 -c:v h264_videotoolbox -b:v 3500k -maxrate 4500k -bufsize 7000k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart sN-social.mp4
  ```

  The result is about 30 MB per clip at 1080×1920.
- The clips have burned-in word captions from the editor, so check them for transcription mistakes in the guest's or product's name before posting.

## Scheduling (API)

This runs after go-live, because the posts need the public Spotify link.

1. Buffer fetches media from a public URL at post time, and there's no upload endpoint. So commit the re-encoded clips to the site as `public/clips/<N>/s1.mp4` … on `main`, and wait for the Vercel deploy. They're stored in Git LFS (`.gitattributes`), and Git LFS is enabled on the Vercel project. If a deploy fails after adding clips with an error that looks like a stale build cache, redeploy with the cache off (`VERCEL_FORCE_NO_BUILD_CACHE=1`, or "Redeploy" without cache in the Vercel dashboard). The URLs are `https://www.devtools.fm/clips/<N>/sN.mp4`. Use the `www` host, because the apex domain 308-redirects. Check with `curl -I` that each one returns `200 video/mp4`.
2. In `social.json`, set `links.spotify` and `schedule` (`start` is the launch date, plus `time` and `timeZone`). Clip *i* goes out on the *i*-th weekday from `start`.
3. Run these:

   ```bash
   pnpm episode:buffer <N> --dry-run     # check the payloads
   pnpm episode:buffer <N>               # create the posts; already-scheduled ones are skipped
   ```

   Use `--only s2` or `--network x` to target one clip or one channel.

`BUFFER_API_KEY` is in `.env`. The script is `scripts/publish/buffer.ts`, built on the GraphQL `createPost` mutation:
- **X, Bluesky, Threads, Mastodon:** threads, via `metadata.<network>.thread`. X's key is `twitter`.
- **YouTube Shorts:** title.
- **Instagram:** a reel shared to the feed.
- **LinkedIn:** the links go in the post text.

Don't use the Buffer web composer for these. Under automation it's unreliable: opening it can take 5–15 seconds, overlays swallow clicks, and text gets typed into the wrong editor.

The X queue still holds several old failed posts from previous years ("stuck processing", "queue was paused"). Leave them alone unless the user asks.
