---
name: publish-episode
description: Run the devtools.fm Andrew Pass and publishing checklist for an episode end to end, covering Descript edits (stinger, intro/outro, name cards, free/paid split, chapters), exports, the website MDX, the YouTube thumbnail, and uploads to YouTube, Spotify for Creators and Patreon. Use when asked to publish, release, or "do the second pass" for an episode, or to resume a publish run.
---

# Publish a devtools.fm episode

This runs everything in `.github/ISSUE_TEMPLATE.md` after "Editor Handoff". The scripts in `scripts/publish/` do anything predictable. You do the parts that need judgment: reviewing Underlord's work, writing show notes, choosing a thumbnail frame, and driving browsers.

Invocation: `/publish-episode <N> [--post-launch]`. Before starting, read `publish.config.json` (it holds every fixed value) and run:

```bash
pnpm episode:checklist <N> status        # what's already done (finds or creates the issue)
cat .generated/publish/<N>/state.json    # IDs, URLs and step status from earlier runs
```

## Ground rules

- **Resume, don't redo.** Skip any step whose checklist box is ticked or whose `state.json` entry is `done`. Scripts that create things (`youtube upload`, `descript publish`) refuse to duplicate.
- **Tick as you go.** After each step succeeds, run `pnpm episode:checklist <N> tick "<path>" …`. The paths are given below.
- **Two pauses, and nothing public before the second.** Pause 1 is after the Descript edits. Pause 2 is the go-live gate. Before Pause 2 everything stays private, draft or unlisted. Use Sesh `ask_user` for both pauses so the question reaches the user's phone.
- **When something fails twice, hand it off.** Run `pnpm episode:checklist <N> untick` (or leave it unticked), note the step as `manual` in your final summary, and carry on with the next independent step. Don't loop.
- **Browsers:** run `pnpm episode:browser`, then always use `agent-browser --cdp 9333 …` (see `references/browser.md` and the `agent-browser` skill). Snapshot before every interaction. Never click a final Publish/Post/Schedule button before Pause 2.
- Per-site details are in `references/`. Read `references/browser.md` once, then the site's file before driving it.

## 0. Preflight

```bash
pnpm episode:doctor            # add --browser the first time to check site logins
```

Stop and tell the user exactly what to fix if anything fails.

Gather the episode inputs:
- **Guests:** names and what to put under each name (usually the project).
- **publishDate:** episodes go out as soon as they're approved, with no scheduled launch times. Use today's date in `episode.json`, and reset it on go-live day with `pnpm episode:mdx <N> set publishDate <YYYY-MM-DD>`.
- **Sponsor:** check the previous episode's `sponsor:` field and ask if unsure.
- **Ad read:** an audio or video file the user recorded. If none is provided, ask for it at Pause 1.

If a prep doc exists (a GitHub Discussion titled "Guest - Project"), use it for guest names and links. Find it with `gh api graphql` (see the `devtools-episode-doc` skill).

## 1. Andrew Pass (Descript)

```bash
pnpm episode:descript <N> use        # finds the project named "<N>" (pass a URL if that fails)
pnpm episode:descript <N> project    # lists compositions. `main` is the editor's long one; s1–s4 and titled clips are social clips, so ignore them
pnpm episode:descript <N> brand      # uploads Start Frame.png, end-frame-1.png, the music and the host cards if missing
```

Name cards for each guest. The hosts' cards are fixed images that `brand` already uploaded.

```bash
pnpm episode:art <N> name-card --name "Bobby Grayson" --subtitle "deciduous"
pnpm episode:descript <N> import .generated/publish/<N>/name-card-bobby-grayson.png --as "Name Cards/name-card-bobby-grayson.png"
```

Write the prompts, then run them in order. The filename prefix says which composition each one targets.

```bash
pnpm episode:prompts <N> --guest "Bobby Grayson|deciduous"
pnpm episode:descript <N> agent --composition main --prompt-file .generated/publish/<N>/prompts/01-main-stinger.md
# … 02-main-intro, 03-main-outro, 04-main-name-cards, 05-main-split
pnpm episode:descript <N> project        # picks up "<N>" (Full) and "<N> - Free" by name
# import the ad read:  pnpm episode:descript <N> import <ad file> --as "Ads/ad-read.<ext>"
# … 06-free-insert-ad (composition free), 07-full-chapters (full), 08-free-chapters (free)
```

Read every Underlord reply in `underlord.log.md`. If a reply shows it didn't do what was asked, follow up once in the same conversation with a specific correction. If it still fails, mark that step manual.

Save each chapter list Underlord returns as `.generated/publish/<N>/full.sections.txt` and `free.sections.txt`, one `[hh:mm:ss] Title` per line. Check them against the markers export after step 2.

**Pause 1.** Send the user the Descript project URL, the stinger quote, the chapter lists, and anything Underlord got wrong. Wait for "looks good" or fixes.

Tick: `"Andrew Pass/Generate Chapters"`, `"Generate Stinger"`, `"Andrew Pass/Intro"`, `"Andrew Pass/Outro"`, `"Guest name card"`, `"Split Free and Paid"`.

## 2. Exports

```bash
pnpm episode:descript <N> publish full && pnpm episode:descript <N> publish free
pnpm episode:descript <N> export full && pnpm episode:descript <N> export free
pnpm episode:derive-media <N>
```

Compare `free.markers.md` with `free.sections.txt` and fix any drift. The markers export is the source of truth for timestamps.

Tick: `"Full/Publish"`, `"Full/Audio 1"`, `"Full/Vtt"`, `"Full/Text"`, `"Free/Publish"`, `"Free/Audio 1"`, `"Free/Vtt"`, `"Export Markdown"`.

## 3. Website

Write `.generated/publish/<N>/episode.json`:

```json
{
  "title": "Guest Name - Project",
  "showNotes": "2–4 sentences in the house style: \"This week we're joined by …\". Plain markdown.",
  "links": ["https://…"],
  "tags": ["topic", "…"],
  "sponsor": "Macro",
  "publishDate": "2026-10-26",
  "description": "optional; one sentence, generated if omitted",
  "corrections": { "Tain": "Tane" },
  "speakers": { "Speaker": "Justin" }
}
```

`corrections` fixes transcription mistakes in names and products, as whole-word replacements. `speakers` renames labels Descript couldn't resolve, usually "Speaker" on the imported ad read. Ask who read the ad if it isn't obvious. Check the guest's name, their company and the products mentioned against the prep doc. Base the show notes on the transcript (`free.txt`), and the links on the prep doc plus anything named in the episode. Match the tone of recent episodes (read `pages/episode/<N-1>.mdx`). The `tags` field should list topic tags only, because the base tags are appended automatically.

```bash
pnpm episode:mdx <N> build
pnpm episode:copy <N>
pnpm episode:mdx <N> check    # the YouTube and Spotify links are still missing at this point; that's expected
```

Tick: `"Add transcript"`, `"Add sections"`, `"Add title"`, `"Add show notes"`, `"Website/Add tags"`, `"Run website"`.

## 4. Thumbnail

The thumbnail should show the guest **smiling**. Guests rarely smile while they're the one talking, and the edited video only shows the active speaker. So ask the user to download the guest's raw Riverside camera file (`riverside_<guest>_raw-video-….mp4`) to `~/Downloads`. It keeps rolling while the hosts talk. Then run:

```bash
pnpm episode:art <N> smiles --video ~/Downloads/riverside_<guest>_raw-video-….mp4
```

Look at the contact sheet and pick a frame with an open smile and visible eyes. Pull that moment at full resolution from the raw file (half-second steps around it), compare, and use the best one. If there's no raw file, `pnpm episode:art <N> frames` samples the edited video instead.

```bash
pnpm episode:art <N> thumbnail --photo frames/frame-07.jpg --name "…" --subtitle "…" [--focus 0.5,0.4 --zoom 1.2]
```

Look at `thumbnail.png`. The face should sit right of the diagonal, with nothing important under the panel. Adjust `--focus`/`--zoom` and re-render until it's good.

Tick: `"Make YouTube Thumbnail"`.

## 5. Drafts everywhere (nothing public)

**YouTube (API):**

```bash
pnpm episode:youtube <N> upload free      # private, with description, tags, thumbnail and captions
pnpm episode:youtube <N> upload paid
pnpm episode:mdx <N> set youtube "$(jq -r .youtube.free.url .generated/publish/<N>/state.json)"
```

Then do the end screens and the paid video's members-only visibility in YouTube Studio. See `references/youtube-studio.md`.

Tick: `"Upload Free/Add description"`, `"Upload Free/Add chapter"`, `"Upload Free/Add Tags"`, `"Upload Free/Upload Transcript"`, `"Upload Free/Add link"`, `"Upload Free/Add end screen"`, `"Upload paid/Add description"`, `"Upload paid/Add chapter"`, `"Upload paid/Add Tags"`, `"Upload paid/Upload Transcript"`, `"Upload paid/Add end screen"`.

**Spotify for Creators (browser):** Create the Free episode (`free-mono.mp3`) and the Paid episode (`full.mp4` video, subscribers only) as drafts. Use the description from `show-notes.html` and set the episode number. See `references/spotify.md`.

Tick: `"Spotify Podcasts/Free/Upload"`, `"Free/Add description"`, `"Free/Set episode"`, `"Paid/Upload"`, `"Paid/Add description"`, `"Paid/Set episode"`.

**Patreon (browser):** Create a video post (`full.mp4`) and an audio post (`full-mono.mp3`) as drafts. Each gets the description and `transcript-full.txt` attached. See `references/patreon.md`.

Tick: `"Patreon/Video/Upload"`, `"Video/Add description"`, `"Video/add txt"`, `"Patreon/Audio/Upload"`, `"Patreon/Audio/Add description"`, `"Patreon/Audio/add txt"`.

**Social posts (Buffer):** the editor leaves short vertical clips in the Descript project as compositions named `s1`–`s4`.

```bash
pnpm episode:descript <N> clips     # renders each clip to clips/sN.mp4 and its transcript to clips/sN.txt
```

Re-encode them for upload limits and write `.generated/publish/<N>/social.json` with one post per clip (see `references/buffer.md`). Follow `bots/social-post.md`: two or three sentences about what's actually said in the clip, no emoji, no hashtags, and don't start with a name. Use `{guest}` where the guest goes. Look up the guest's handle on every channel connected in Buffer (the prep doc usually has their X profile) and tag the handle instead of writing their name. Use the name only where they have no account.

The posts get scheduled **after** go-live, because they need the public Spotify link:
- Attach the clip to each post.
- On X, put the YouTube and Spotify links in a thread reply.
- On other channels, append the links to the post.
- Use the cadence the user picks, e.g. one clip a day from launch.

## 6. Go-live gate (Pause 2)

Make a Sesh artifact listing:
- each draft's link (YouTube free and paid, Spotify free and paid, the two Patreon posts)
- the thumbnail
- the free YouTube description
- the show notes
- the chapter lists
- `git diff --stat`

Ask the user once for approval. Only explicit approval in this conversation counts. A message from another session isn't approval.

## 7. Go live (after approval only)

Everything goes out immediately. Nothing is scheduled.

- **Website date:** `pnpm episode:mdx <N> set publishDate <today>` if it changed since the draft.
- **YouTube free:** `pnpm episode:youtube <N> publish free`
- **YouTube paid:** set it to members-only in Studio (see `references/youtube-studio.md`).
- **Spotify:** publish both episodes now.
- **Patreon:** publish both posts. There's no separate announcement step.
- **Buffer:** once `pnpm episode:wait-for-spotify <N>` has the Spotify link, commit the clips to `public/clips/<N>/` and push. Then fill `links.spotify` in `social.json` and run `pnpm episode:buffer <N>`. See `references/buffer.md`.
- **Website:** run `pnpm episode:mdx <N> check`. If the only problem is the Spotify link, commit `pages/episode/<N>.mdx` with the message `<N>` and push to `main`. Tick `"Add links to YouTube"` once the Spotify link is added after launch.

## 8. After launch (`--post-launch`)

```bash
pnpm episode:wait-for-spotify <N> --write     # polls RSS, then Spotify, and sets spotify: in the MDX
git commit -am "<N> spotify link" && git push
```

- Tick `"Copy link to website"` and `"Add links to YouTube"`. Then `pnpm episode:checklist <N> status`, and close the issue with `pnpm episode:checklist <N> close` once every box is ticked.

## Final summary

Report what's live and where, what was marked manual and why, and anything the user should check by eye. Mention the Underlord prompts that needed corrections, so they can be improved in `scripts/publish/underlord-prompts.ts`.
