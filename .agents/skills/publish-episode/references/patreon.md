# Patreon

New post: `publish.config.json` → `patreon.postUrl`.

Each episode gets two posts. Both go to **paid members** and both start as drafts.

## How the editor works (learned on 179)

- Opening `/posts/new` immediately creates a draft and redirects to `/posts/<id>/edit`. Patreon saves automatically ("Saving", then "Saved" at the top), so there's no Save button to press.
- Don't click the Video/Audio buttons. They open a native file picker. Instead, upload straight to the hidden inputs: tag the one with `accept=".aac,.m4a,.mp3…"` (audio) or `accept="video/*"` (video) via `eval`, then `ab upload '#that-id' <file>`. The attachment input is the one with `accept="*"`.
- **Body:** click the "Text input field for post content" box, then `document.execCommand('insertHTML', …)` with `show-notes-paid.html`.
- The default audience is already Paid access, all tiers.

## Video post

1. Create a new post and choose the **Video** type. Upload `.generated/publish/<N>/full.mp4`. It's large, so wait for processing to finish.
2. **Title:** just the episode title ("Guest - Project"), the same for the video and audio posts. That matches every recent post.
3. **Body:** insert `show-notes-paid.html` (see `browser.md`). It has the ad-free cut's chapter times.
4. **Attachments:** add `transcript-full.txt` as the transcript.
5. **Audience:** paid members (all tiers unless the last post differs).
6. Save the draft and record `state.json` → `patreon.videoPostUrl`.

## Audio post

Same steps, but with the **Audio** post type and `full-mono.mp3`. Record `patreon.audioPostUrl`.

## After approval

Publish both posts. A successful publish redirects to `/posts/<slug>-<id>?pr=true` and opens a share dialog; close it. The first Publish click can silently do nothing (it did on 179's audio post), so confirm both posts show on `patreon.com/c/devtoolsfm/posts` and click again if one is missing. There's no separate announcement: Patreon's own post notification is enough, and there's no Discord post anymore.

Ticks: `"Patreon/Video/Upload"`, `"Video/Add description"`, `"Video/add txt"`, `"Patreon/Audio/Upload"`, `"Patreon/Audio/Add description"`, `"Patreon/Audio/add txt"`.
