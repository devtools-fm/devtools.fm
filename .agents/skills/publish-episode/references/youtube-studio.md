# YouTube Studio (things the API can't do)

`pnpm episode:youtube` handles uploading, the description, tags, the thumbnail, captions and making the free video public. Studio is only needed for the items below. Video IDs are in `.generated/publish/<N>/state.json` under `youtube.free` and `youtube.paid`.

Editor URL: `https://studio.youtube.com/video/<videoId>/edit`

## End screen (both videos)

1. Open the editor and click **End screen**.
2. Click **Import from video** and pick the previous episode. It has the standard layout: the subscribe element plus the "best for viewer" video. Use the same import for the paid video.
3. Importing from the previous episode gives a Subscribe element and a "Best for viewer" video over the last ~19 seconds, the same as earlier episodes. Keep it as imported.
4. Click **Save**.

Ticks: `"Upload Free/Add end screen"`, `"Upload paid/Add end screen"`.

## Paid video: members-only

The API can't set members-only visibility. Before Pause 2, leave the video Private.

After approval:
1. In the editor, open **Visibility**.
2. Choose **Members only** (or whichever members level the channel uses) and **Save**. It goes out right away. Nothing is scheduled.

## Checks before Pause 2

- Captions show under **Subtitles**. Uploaded captions can take a few minutes to appear.
- Chapters appear on the progress bar once processing finishes. If they don't, run `pnpm episode:copy` again to see the chapter validation warnings, fix the sections, then run `pnpm episode:youtube <N> update free`.
- The thumbnail is set on both videos.
