/**
 * Check everything the publish pipeline needs before starting a run.
 *
 *   pnpm episode:doctor [--browser]
 *
 * --browser also starts the devtools.fm Chrome (pnpm episode:browser) and opens each platform to
 * confirm you're logged in. That's slower and opens a window, so it's opt-in.
 */
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { ensureBrowser } from "./browser";
import { browserArgs, config, parseArgs, ROOT } from "./lib";

type Result = { ok: boolean; label: string; fix?: string };
const results: Result[] = [];

function check(label: string, fn: () => boolean | string, fix?: string) {
  try {
    const value = fn();
    results.push({ ok: value !== false, label: typeof value === "string" ? `${label}: ${value}` : label, fix });
  } catch (error) {
    results.push({ ok: false, label: `${label}: ${(error as Error).message.split("\n")[0]}`, fix });
  }
}

const quiet = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

async function main() {
  const { flags } = parseArgs();

  check("ffmpeg runs", () => quiet("ffmpeg", ["-version"]).split("\n")[0], "brew reinstall ffmpeg");
  check("ffprobe runs", () => Boolean(quiet("ffprobe", ["-version"])), "brew reinstall ffmpeg");
  check("gh is logged in", () => (quiet("gh", ["auth", "status"]), true), "gh auth login");
  check("Chrome for rendering art", () => fs.existsSync(process.env.CHROME_PATH || config.art.chromePath), "Install Google Chrome or set CHROME_PATH");
  check("Display font", () => fs.existsSync(path.join(ROOT, config.art.displayFont)), "Check art.displayFont in publish.config.json");
  check("agent-browser installed", () => quiet("agent-browser", ["--version"]), "brew install agent-browser && agent-browser install");
  check(
    "YouTube OAuth client",
    () => fs.existsSync(path.join(os.homedir(), ".config", "devtools-fm", "youtube-client.json")),
    "Create a Desktop OAuth client (YouTube Data API v3) and save it to ~/.config/devtools-fm/youtube-client.json"
  );
  check(
    "YouTube token",
    () => fs.existsSync(path.join(os.homedir(), ".config", "devtools-fm", "youtube-token.json")),
    "pnpm episode:youtube auth"
  );
  check(
    "LLM key for descriptions",
    () => Boolean(process.env.ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) || "none (Claude writes description into episode.json instead)"
  );

  const descriptToken = process.env.DESCRIPT_TOKEN || process.env.DESCRIPT_API_TOKEN;
  if (descriptToken) {
    try {
      const response = await fetch(`${config.descript.apiBase}/status`, {
        headers: { Authorization: `Bearer ${descriptToken}` },
      });
      results.push({ ok: response.ok, label: `Descript API token (${response.status})`, fix: "Create a new token in Descript → Settings → API tokens" });
    } catch (error) {
      results.push({ ok: false, label: `Descript API: ${(error as Error).message}` });
    }
  } else {
    results.push({ ok: false, label: "DESCRIPT_TOKEN", fix: "Add DESCRIPT_TOKEN to .env (Descript → Settings → API tokens)" });
  }

  if (flags.browser) {
    await ensureBrowser();
    const browser = browserArgs();
    const sites: [string, string, RegExp][] = [
      ["Spotify for Creators", config.spotify.dashboardUrl, /login|signin|accounts\.spotify/i],
      ["Patreon", "https://www.patreon.com/home", /login|signin/i],
      ["YouTube Studio", "https://studio.youtube.com", /accounts\.google|signin/i],
    ];
    for (const [name, url, loginPattern] of sites) {
      check(
        `${name} logged in`,
        () => {
          // A throwaway tab, so the user's own tabs in that window are left alone.
          quiet("agent-browser", [...browser, "tab", "new", url]);
          try {
            quiet("agent-browser", [...browser, "wait", "--load", "networkidle"]);
            const landed = quiet("agent-browser", [...browser, "get", "url"]);
            return !loginPattern.test(landed) || `redirected to ${landed}`;
          } finally {
            quiet("agent-browser", [...browser, "tab", "close"]);
          }
        },
        `Log in to ${url} in the devtools.fm Chrome window (pnpm episode:browser) and leave it open`
      );
    }
  }

  for (const result of results) {
    console.log(`${result.ok ? "✓" : "✖"} ${result.label}${!result.ok && result.fix ? `\n    → ${result.fix}` : ""}`);
  }

  if (results.some((result) => !result.ok)) process.exit(1);
}

main();
