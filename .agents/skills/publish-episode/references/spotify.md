# Spotify for Creators (formerly Spotify for Podcasters / Anchor)

Dashboard: `publish.config.json` → `spotify.dashboardUrl`. The public feed this publishes to is `spotify.rssUrl`, which is also what Apple and other apps read.

## The wizard (learned on 179)

The flow is Upload → Details → Monetize → Review.

1. **Upload:** go to Episodes → **New episode**, then `ab upload 'input[type=file]' <file>`. "Preview ready!" means the upload is processed.
2. **Details:**
   - **Title:** fill the "Title (required)" textbox.
   - **Description:** tick the **HTML** checkbox under it. The editor becomes a plain textarea, so `fill` it with `show-notes.html` (limit 4,000 characters).
   - **Content checks:** leave "Explicit" off. "Promotional content" is a judgment call when the free cut has a sponsor read; ask if unsure.
   - **Additional details:** episode type **Full**. There are two "Enter number" spinbuttons: the first is the season, the second is the **episode number**.
   - Then click **Next**.
3. **Monetize:** "Who is this episode for?" Choose **Everyone** for Free, **Subscribers only** for Paid. The radios are hidden inputs, so use `ab check @ref`, because `click` doesn't register. Re-snapshot to confirm `checked=true`, then click **Next**.
   - Don't click **Next** on Details while a big upload is still running. The click queues, and when the upload finishes the wizard can jump past Monetize with the default audience (Everyone). Wait for "Preview ready!" first. If it skipped ahead anyway, click **Back** and check the audience.
4. **Review:** it only offers **Publish** (with Now/Schedule). **Don't click it before Pause 2.** To save a draft, click the wizard's **Close** button, then **Save draft** in the "Save draft?" dialog.

The draft then appears in the Episodes list with status Draft. Record its link href in `state.json`.

## Free episode (draft)

Upload `.generated/publish/<N>/free-mono.mp3`. Use the title from `episode.json` and episode number `<N>`. Audience is **Everyone**. Record the draft URL in `state.json` → `spotify.freeDraftUrl`.

## Paid episode (draft)

Upload the **video** `full.mp4` (the ad-free full cut). Video episodes also have a **Thumbnails** picker: upload `thumbnail.png` to the file input inside the "Thumbnails" section. It's the first `input[type=file]`; the second is episode art. It's several GB, so wait for "Preview ready!", polling the page every minute or so. Use the same title and episode number, with `show-notes-paid.html` (full-cut chapters) as the description. Audience is **Subscribers only**. Record the draft URL in `spotify.paidDraftUrl`.

## After approval

Publish both drafts right away. Nothing is scheduled. Spotify's public link only exists once the episode is live. `pnpm episode:wait-for-spotify <N> --write` picks it up later.

Ticks: `"Spotify Podcasts/Free/Upload"`, `"Free/Add description"`, `"Free/Set episode"`, `"Paid/Upload"`, `"Paid/Add description"`, `"Paid/Set episode"`. Tick `"Copy link to website"` after the post-launch step.
