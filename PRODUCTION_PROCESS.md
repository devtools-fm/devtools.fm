# Production Process

The current publishing process for an episode.
We should automate more of this (well at least publishing).

## Editing

1. **First Pass:**

   - Hide video
   - Fix transcript
   - Fix Grammar
   - Fix timing issues
   - Make cuts

   **Timing style guide:**

   - If people take super long pauses shorten it to `.5-1s`
   - If a sentence starts with a filler word, super repeated word, or a false start I remove it
   - Remove mid sentence filler word if the audio still works

2. **Second Pass:**

   - Run at `2x` speed
   - Make sure the script is really right
   - Fix remaining grammar issues

3. **Third Pass:**

   - Run at `3x` speed
   - Make video cuts and switch between speakers

4. Add intro and outro
5. Add section markers
6. Break sections that are 8+ minutes into clips for secondary YouTube account

## Andrew Pass and Publishing (automated)

Everything after "Editor Handoff" in the episode issue checklist runs from Claude Code:

```
/publish-episode <N>                 # Andrew Pass → exports → website → thumbnail → drafts → go-live
/publish-episode <N> --post-launch   # Spotify link on the website
```

It pauses twice: once to review the Descript edits, and once before anything goes public. The runbook is `.agents/skills/publish-episode/SKILL.md`. The scripts are in `scripts/publish/` (run `pnpm episode:<name>`), and the fixed settings are in `publish.config.json`.

- **Descript (API):** stinger, intro/outro, guest name cards, the free/paid split, ad insertion, chapters, rendering, and transcript exports. The Underlord prompts are in `scripts/publish/underlord-prompts.ts`.
- **Website:** `pages/episode/<N>.mdx` is built from the Descript transcript and chapters.
- **YouTube (API):** private uploads with description, chapters, tags, thumbnail and captions, made public once approved (nothing is scheduled). End screens and the paid video's members-only 9pm launch are done in YouTube Studio through the browser.
- **Spotify for Creators, Patreon (browser):** driven with `agent-browser` in a logged-in `devtoolsfm` session.
- **Art:** the YouTube thumbnail and guest name cards are rendered from the Figma vectors in `assets/thumbnail/` (font: Paytone One).

Setup (once per machine): run `pnpm episode:doctor --browser` and follow its instructions. That covers the Descript API token, the YouTube OAuth client, agent-browser logins, and ffmpeg.
