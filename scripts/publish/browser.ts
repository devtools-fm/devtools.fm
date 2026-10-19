/**
 * Start (or find) the devtools.fm Chrome window that agent-browser attaches to.
 *
 *   pnpm episode:browser            # prints the CDP port once Chrome is ready
 *
 * Then drive it with `agent-browser --cdp <port> …`.
 *
 * Why not let agent-browser launch Chrome itself: Google refuses to sign in to a browser under
 * automation, and its session cookies don't survive into a fresh automated launch. A normal
 * Chrome on a dedicated profile, started with a debugging port, keeps every login (YouTube Studio,
 * Spotify, Patreon) and agent-browser just attaches to it.
 */
import { spawn } from "child_process";
import fs from "fs";

import { browserProfileDir, config, fail } from "./lib";

export async function cdpReady(port = config.browser.cdpPort) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function ensureBrowser() {
  const port = config.browser.cdpPort;
  if (await cdpReady(port)) return port;

  const chrome = process.env.CHROME_PATH || config.art.chromePath;
  if (!fs.existsSync(chrome)) fail(`Chrome not found at ${chrome}. Set CHROME_PATH or art.chromePath.`);
  fs.mkdirSync(browserProfileDir(), { recursive: true });

  spawn(chrome, [`--user-data-dir=${browserProfileDir()}`, `--remote-debugging-port=${port}`, "--no-first-run", "--no-default-browser-check"], {
    detached: true,
    stdio: "ignore",
  }).unref();

  for (let i = 0; i < 30; i++) {
    if (await cdpReady(port)) return port;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  fail(`Chrome didn't open its debugging port ${port}. Is another Chrome already using ${browserProfileDir()}? Quit it and retry.`);
}

if (require.main === module) {
  ensureBrowser().then((port) => console.log(port));
}
