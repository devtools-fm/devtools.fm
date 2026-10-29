# Driving the browser

All browser work happens in one long-running, normal Chrome window on the devtools.fm profile. agent-browser attaches to it over CDP and never launches its own browser. Google refuses sign-in under automation, and its cookies don't survive into an automated launch, so attaching is the only setup that keeps YouTube Studio logged in.

```bash
pnpm episode:browser    # starts the window if needed and prints the port (publish.config.json → browser.cdpPort)
# A function, not a variable: zsh doesn't word-split "$B".
ab() { agent-browser --cdp 9333 "$@"; }
ab tab new <url> && ab wait --load networkidle && ab snapshot -i
```

- **Logins:** the user signs in once per site *by hand* in that window. Never type passwords for them. `pnpm episode:doctor --browser` checks every site.
- **Work in new tabs** (`ab tab new <url>`) and close them when you're done (`ab tab close`). Never run `ab close`, because that would quit the user's logged-in window.
- **Refs go stale** after navigation or any DOM change. Re-snapshot before each interaction, and don't reuse old `@e` refs.
- **File uploads:** `ab upload @eN /absolute/path/file`. Target the `<input type=file>` ref, which is often hidden. Use `snapshot -i -C` if it doesn't appear. Wait for the site's upload progress to finish before saving, because large videos take minutes. Poll with `ab snapshot -i` every 30–60s instead of sleeping blindly.
- **Rich text descriptions:** Spotify and Patreon use contenteditable editors. Focus the editor with a click, then insert the generated HTML so links survive:

  ```bash
  HTML=$(jq -Rs . < .generated/publish/<N>/show-notes.html)
  ab eval --stdin <<EOF
  document.execCommand("insertHTML", false, $HTML)
  EOF
  ```

  Then snapshot and check that the paragraphs and links came through. If the editor strips HTML, fall back to `ab type @eN "$(cat show-notes.txt)"`.
- **Screenshot every form before saving** (`ab screenshot --annotate`) and keep the paths for the go-live summary.
- **Never click Publish, Post or Schedule before the user approves at Pause 2.** Use the site's Save draft action. If a site has no draft state, stop at the last screen before publishing and record that in `state.json`.
- If a selector or flow in these notes is out of date, adapt from the snapshot and update the note afterwards.
