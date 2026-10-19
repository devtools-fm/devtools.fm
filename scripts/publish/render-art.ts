/**
 * YouTube thumbnail and guest name cards, built from the Figma "YouTube Thumbnail" and "Name Card" frames.
 *
 *   pnpm episode:art 179 frames [--count 12]          # candidate guest stills from free.mp4
 *   pnpm episode:art 179 smiles --video ~/Downloads/riverside_<guest>_raw….mp4
 *       # best for thumbnails: scans the guest's raw camera (which keeps rolling while others talk)
 *       # for frames where they're smiling with eyes open, and writes a contact sheet
 *   pnpm episode:art 179 thumbnail --photo frames/frame-07.jpg --name "Bobby Grayson" --subtitle "deciduous"
 *   pnpm episode:art 179 name-card --name "Bobby Grayson" --subtitle "deciduous"   # transparent PNG for the video
 *
 * Photo framing: --focus 0.5,0.35 (point of the photo to center, as fractions) and --zoom 1.2.
 *
 * The panel, wordmark and dots are the exported Figma vectors (assets/thumbnail/youtube-static.svg).
 * The name card is rebuilt here with Figma's gradients and blur so it can grow with the guest's
 * name. Text is sized by measuring the real glyphs so cap heights match the Figma frame whatever
 * font is configured. Rendering goes through Chrome so SVG filters look exactly like Figma.
 */
import fs from "fs";
import path from "path";

import { config, episodeFile, fail, parseArgs, requireEpisode, ROOT, run } from "./lib";

// Figma frame units (3840×2160). Measured from the export.
const FRAME = { width: 3840, height: 2160 };
const PHOTO_X = 1115;
const NUMBER = { x: 1337, baseline: 451, capHeight: 105 };
const NAME = { x: 234.2, baseline: 1116.66, capHeight: 106 };
const SUBTITLE = { x: 230.2, baseline: 1339.2, ascender: 88 };
const CARD = { x: 139.466, y: 750.365, width: 1518.64, height: 766.27, radius: 96.09, rightPadding: 237.3 };

type Text = { family: string; weight: number; size: number; width: number };

function fontFaces() {
  const faces: string[] = [];
  for (const [family, file, weight] of [
    ["Display", config.art.displayFont, 400],
    ["Mono", config.art.monoFont, 400],
  ] as const) {
    if (!file) continue;
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) fail(`Missing font ${full}.`);
    const format = { ".woff2": "woff2", ".woff": "woff", ".otf": "opentype" }[path.extname(full)] || "truetype";
    faces.push(
      `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url(data:font/${format};base64,${fs
        .readFileSync(full)
        .toString("base64")}) format("${format}"); }`
    );
  }
  return faces.join("\n");
}

const displayFamily = () => (config.art.displayFont ? `"Display"` : `"${config.art.displayFamily}"`);
const monoFamily = () => (config.art.monoFont ? `"Mono"` : `"${config.art.monoFamily}"`);

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Card + glow, from the Figma layers, stretched horizontally by `dx`. */
function card(dx: number) {
  const width = CARD.width + dx;
  const scale = width / CARD.width;
  return `
<defs>
  <radialGradient id="bezel" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
    gradientTransform="matrix(-0.269438 741.197 ${-1493.58 * scale} -1.02669 ${899.058 + dx / 2} 762.898)">
    <stop stop-color="#BEBEC0"/><stop offset="0.0001" stop-color="#E9E9E9"/>
    <stop offset="0.492861" stop-color="#BEBEC0"/><stop offset="0.692708" stop-color="#9D9D9E"/>
  </radialGradient>
  <radialGradient id="glow0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.61522 151.366 -305.096 6.15315 405.318 763.918)">
    <stop stop-color="#EB7ED9"/><stop offset="1" stop-color="#EB7ED9" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(62.4547 136.563 -275.258 237.92 227.915 780.572)">
    <stop stop-color="#C288FF"/><stop offset="1" stop-color="#EB7ED9" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(11.0373 160.248 -322.999 42.0462 513.537 762.898)">
    <stop stop-color="#FF88EC"/><stop offset="1" stop-color="#EB7ED9" stop-opacity="0"/>
  </radialGradient>
  <filter id="blur" x="133" y="744" width="${1531 + dx}" height="780" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="7.00417"/>
  </filter>
</defs>
<rect x="${CARD.x}" y="${CARD.y}" width="${width}" height="${CARD.height}" rx="${CARD.radius}" fill="#232327" stroke="url(#bezel)" stroke-width="25.0676"/>
${[0, 1, 2]
  .map(
    (i) =>
      `<g filter="url(#blur)"><rect x="149.665" y="${i === 2 ? 760.564 : 761.583}" width="${1498.2 + dx}" height="745.648" rx="85.8898" stroke="url(#glow${i})" stroke-width="4.66945" fill="none"/></g>`
  )
  .join("\n")}
<rect x="162.445" y="773.343" width="${1474.3 + dx}" height="721.107" rx="73.114" fill="#232327" stroke="black" stroke-width="20.8896"/>`;
}

function photoLayer(
  photo: string,
  size: { width: number; height: number },
  focus: [number, number],
  zoom: number,
  view: { x: number; y: number; width: number; height: number }
) {
  const box = { x: PHOTO_X, y: view.y, width: view.x + view.width - PHOTO_X, height: view.height };
  const cover = Math.max(box.width / size.width, box.height / size.height) * zoom;
  const width = size.width * cover;
  const height = size.height * cover;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const x = clamp(box.x + box.width / 2 - focus[0] * width, box.x + box.width - width, box.x);
  const y = clamp(box.y + box.height / 2 - focus[1] * height, box.y + box.height - height, box.y);
  return `<image href="${photo}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`;
}

function svgDocument(inner: string, view: { x: number; y: number; width: number; height: number }, background = "#000") {
  return `<!doctype html><html><head><style>
${fontFaces()}
html, body { margin: 0; background: ${background}; }
svg { display: block; }
</style></head><body>
<svg id="art" xmlns="http://www.w3.org/2000/svg" viewBox="${view.x} ${view.y} ${view.width} ${view.height}" width="100%" height="100%">
${inner}
</svg></body></html>`;
}

async function launch() {
  const puppeteer = require("puppeteer");
  const executablePath = process.env.CHROME_PATH || config.art.chromePath;
  if (!fs.existsSync(executablePath)) fail(`Chrome not found at ${executablePath}. Set CHROME_PATH or art.chromePath.`);
  return puppeteer.launch({ executablePath, args: ["--force-color-profile=srgb"] });
}

/** Font size that gives a glyph run the target height, plus the run's width at that size. */
async function fitText(page: any, text: string, family: string, weight: number, probe: string, targetHeight: number): Promise<Text> {
  return page.evaluate(
    async ({ text, family, weight, probe, targetHeight }: any) => {
      // fonts.ready resolves before a face is first used, so load this one explicitly.
      await (document as any).fonts.load(`${weight} 100px ${family}`, text + probe);
      const svg = document.getElementById("art") as any;
      const make = (value: string, size: number) => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
        node.setAttribute("font-family", family);
        node.setAttribute("font-weight", String(weight));
        node.setAttribute("font-size", String(size));
        node.textContent = value;
        svg.appendChild(node);
        const box = node.getBBox();
        node.remove();
        return box;
      };
      // getBBox height is the font's line box, so measure the ink with canvas instead.
      const canvas = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      canvas.font = `${weight} 1000px ${family}`;
      const metrics = canvas.measureText(probe);
      const inkPer1000 = metrics.actualBoundingBoxAscent;
      const size = (targetHeight / inkPer1000) * 1000;
      return { family, weight, size, width: make(text, size).width };
    },
    { text, family, weight, probe, targetHeight }
  );
}

async function imageSize(page: any, src: string) {
  return page.evaluate(
    (src: string) =>
      new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = reject;
        image.src = src;
      }),
    src
  );
}

function dataUri(file: string) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

const OUTPUT = { width: 1920, height: 1080 };
const VIEW = { x: 0, y: 0, width: FRAME.width, height: FRAME.height };

async function renderThumbnail(episode: string, flags: Record<string, string | true>) {
  const photoArg = flags.photo;
  if (typeof photoArg !== "string") fail("Pass --photo <image> (try `frames` to pull stills from the episode).");
  const photoPath = path.isAbsolute(photoArg) ? photoArg : fs.existsSync(photoArg) ? path.resolve(photoArg) : episodeFile(episode, photoArg);
  if (!fs.existsSync(photoPath)) fail(`Photo not found: ${photoPath}`);
  if (typeof flags.name !== "string" || typeof flags.subtitle !== "string") fail("Pass --name and --subtitle.");

  const name = flags.name;
  const subtitle = flags.subtitle;
  const focus = (typeof flags.focus === "string" ? flags.focus : "0.5,0.4").split(",").map(Number) as [number, number];
  const zoom = Number(flags.zoom) || 1;
  const output = OUTPUT;
  const view = VIEW;
  const staticLayers = fs.readFileSync(path.join(ROOT, "assets", "thumbnail", "youtube-static.svg"), "utf8").replace(/<!--[\s\S]*?-->/, "");
  const photo = dataUri(photoPath);

  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: output.width, height: output.height, deviceScaleFactor: 1 });
    await page.setContent(svgDocument("", view), { waitUntil: "load" });

    const [numberText, nameText, subtitleText, size] = await Promise.all([
      fitText(page, `#${episode}`, displayFamily(), 400, "178", NUMBER.capHeight),
      fitText(page, name, displayFamily(), 400, "H", NAME.capHeight),
      fitText(page, subtitle, monoFamily(), 400, "d", SUBTITLE.ascender),
      imageSize(page, photo),
    ]);

    const textRight = Math.max(NAME.x + nameText.width, SUBTITLE.x + subtitleText.width);
    const dx = Math.max(0, textRight + CARD.rightPadding - (CARD.x + CARD.width));
    const text = (value: string, spec: Text, x: number, y: number) =>
      `<text x="${x}" y="${y}" font-family='${spec.family}' font-weight="${spec.weight}" font-size="${spec.size}" fill="white">${escapeXml(value)}</text>`;

    const inner = [
      `<rect x="${view.x}" y="${view.y}" width="${view.width}" height="${view.height}" fill="#C4C4C4"/>`,
      photoLayer(photo, size, focus, zoom, view),
      staticLayers,
      text(`#${episode}`, numberText, NUMBER.x, NUMBER.baseline),
      card(dx),
      // Dots sit above the card fill, so draw them again on top.
      (staticLayers.match(/<g id="dots">[\s\S]*?<\/g>/) || [""])[0],
      text(name, nameText, NAME.x, NAME.baseline),
      text(subtitle, subtitleText, SUBTITLE.x, SUBTITLE.baseline),
    ].join("\n");

    await page.setContent(svgDocument(inner, view), { waitUntil: "load" });
    await page.evaluate(() => (document as any).fonts.ready);

    const out = typeof flags.out === "string" ? flags.out : episodeFile(episode, "thumbnail.png");
    await page.screenshot({ path: out, type: "png" });
    if (dx > 0) console.error(`  … card widened by ${(dx / 3).toFixed(0)}px for "${name}"`);
    console.log(out);
  } finally {
    await browser.close();
  }
}

// Figma "Name Card" frame (2875×1130).
const NAME_CARD = {
  width: 2875,
  height: 1130,
  // Everything between the rounded corners stretches; the corners stay put.
  slice: { left: 320, right: 2555 },
  name: { x: 276.8, baseline: 531, capHeight: 206.4 },
  subtitle: { x: 273.3, baseline: 858.8, ascender: 154.8 },
  rightPadding: 2875 - (276.8 + 2310.1),
};

async function renderNameCard(episode: string, flags: Record<string, string | true>) {
  if (typeof flags.name !== "string" || typeof flags.subtitle !== "string") fail("Pass --name and --subtitle.");
  const { name, subtitle } = flags;
  const frame = fs.readFileSync(path.join(ROOT, "assets", "thumbnail", "name-card-frame.svg"), "utf8").replace(/<!--[\s\S]*?-->/, "");
  const C = NAME_CARD;
  const browser = await launch();

  try {
    const page = await browser.newPage();
    await page.setContent(svgDocument("", { x: 0, y: 0, width: C.width, height: C.height }), { waitUntil: "load" });
    const [nameText, subtitleText] = await Promise.all([
      fitText(page, name, displayFamily(), 400, "H", C.name.capHeight),
      fitText(page, subtitle, monoFamily(), 400, "d", C.subtitle.ascender),
    ]);

    const textRight = Math.max(C.name.x + nameText.width, C.subtitle.x + subtitleText.width);
    const minWidth = C.slice.left + (C.width - C.slice.right) + 200;
    const width = Math.max(minWidth, Math.ceil(textRight + C.rightPadding));
    const dx = width - C.width;
    const middle = C.slice.right - C.slice.left;
    const scale = (middle + dx) / middle;
    // Each slice gets its own copy of the frame with unique ids. Masks and filters don't
    // survive being referenced through <use>, so the frame can't be shared.
    const copy = (suffix: string) => frame.replace(/id="([^"]+)"/g, `id="$1-${suffix}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);
    // 1px overlaps hide anti-aliasing seams between slices.
    const inner = `
<defs>
  <clipPath id="slice-l"><rect x="0" y="0" width="${C.slice.left + 1}" height="${C.height}"/></clipPath>
  <clipPath id="slice-m"><rect x="${C.slice.left}" y="0" width="${middle + dx}" height="${C.height}"/></clipPath>
  <clipPath id="slice-r"><rect x="${C.slice.right + dx - 1}" y="0" width="${C.width - C.slice.right + 1}" height="${C.height}"/></clipPath>
  <linearGradient id="name-fill" x1="0" y1="197" x2="0" y2="616" gradientUnits="userSpaceOnUse">
    <stop stop-color="#EB7ED9"/><stop offset="1" stop-color="#C288FF"/>
  </linearGradient>
</defs>
<g clip-path="url(#slice-l)">${copy("l")}</g>
<g clip-path="url(#slice-m)"><g transform="translate(${C.slice.left} 0) scale(${scale} 1) translate(${-C.slice.left} 0)">${copy("m")}</g></g>
<g clip-path="url(#slice-r)"><g transform="translate(${dx} 0)">${copy("r")}</g></g>
<text x="${C.name.x}" y="${C.name.baseline}" font-family='${nameText.family}' font-weight="${nameText.weight}" font-size="${nameText.size}" fill="url(#name-fill)">${escapeXml(name)}</text>
<text x="${C.subtitle.x}" y="${C.subtitle.baseline}" font-family='${subtitleText.family}' font-weight="400" font-size="${subtitleText.size}" fill="white">${escapeXml(subtitle)}</text>`;

    await page.setViewport({ width, height: C.height, deviceScaleFactor: 1 });
    await page.setContent(svgDocument(inner, { x: 0, y: 0, width, height: C.height }, typeof flags.background === "string" ? flags.background : "transparent"), { waitUntil: "load" });
    await page.evaluate(() => (document as any).fonts.ready);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const out = typeof flags.out === "string" ? flags.out : episodeFile(episode, `name-card-${slug}.png`);
    await page.screenshot({ path: out, type: "png", omitBackground: !flags.background });
    console.log(out);
  } finally {
    await browser.close();
  }
}

/** Smiling, eyes-open frames from a raw camera file, via macOS Core Image (find-smiles.swift). */
function smiles(episode: string, video: string, limit: number) {
  if (!fs.existsSync(video)) fail(`No such video: ${video}`);
  const dir = episodeFile(episode, "frames/smiles");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  console.error("  … extracting a frame every 2s");
  run("ffmpeg", ["-y", "-loglevel", "error", "-hwaccel", "videotoolbox", "-i", video, "-vf", "fps=1/2,scale=960:-1", "-q:v", "3", path.join(dir, "f-%05d.jpg")]);

  console.error("  … detecting smiles");
  const rows = run("swift", [path.join(ROOT, "scripts/publish/find-smiles.swift"), dir])
    .trim()
    .split("\n")
    .map((line) => line.split("\t"))
    .filter(([, smile, eyesOpen]) => smile === "1" && eyesOpen === "1");

  // Spread the picks across the episode instead of taking one long smiling stretch.
  const step = Math.max(1, Math.floor(rows.length / limit));
  const picks = rows.filter((_, i) => i % step === 0).slice(0, limit);
  const lines = picks.map(([file]) => {
    const seconds = (Number(file.match(/\d+/)![0]) - 1) * 2;
    return `${path.join(dir, file)}\t${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  });
  fs.writeFileSync(path.join(dir, "picks.txt"), `${lines.join("\n")}\n`);

  const sheet = path.join(dir, "contact-sheet.jpg");
  const list = picks.map(([file]) => `file '${path.join(dir, file)}'`).join("\n");
  fs.writeFileSync(path.join(dir, "picks.ffconcat"), `ffconcat version 1.0\n${list}\n`);
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(dir, "picks.ffconcat"), "-vf", "scale=320:-1,tile=6x4:padding=4", "-frames:v", "1", sheet]);

  console.log(`${rows.length} smiling frames; ${picks.length} picks listed in ${path.join(dir, "picks.txt")} (file + time)`);
  console.log(sheet);
  console.log("Grab the chosen moment at full resolution with: ffmpeg -ss <seconds> -i <video> -frames:v 1 -q:v 1 frame.jpg");
}

function frames(episode: string, count: number) {
  // Either cut works; take whichever has rendered first.
  const video = ["free.mp4", "full.mp4"].map((name) => episodeFile(episode, name)).find((file) => fs.existsSync(file));
  if (!video) fail(`No free.mp4 or full.mp4 in ${episodeFile(episode, "")} yet.`);

  const duration = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).trim());
  const dir = episodeFile(episode, "frames");
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 1; i <= count; i++) {
    // Skip the stinger/intro and the outro.
    const at = Math.floor(duration * (0.08 + (0.84 * i) / (count + 1)));
    const out = path.join(dir, `frame-${String(i).padStart(2, "0")}.jpg`);
    run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(at), "-i", video, "-frames:v", "1", "-q:v", "2", out]);
    console.log(`${out}  (${at}s)`);
  }
}

async function main() {
  const { positionals, flags } = parseArgs();
  const episode = requireEpisode(positionals);
  const command = positionals[positionals.indexOf(episode) + 1];

  switch (command) {
    case "frames":
      return frames(episode, Number(flags.count) || 12);
    case "smiles":
      if (typeof flags.video !== "string") fail("Pass --video <the guest's raw camera file>.");
      return smiles(episode, flags.video.replace(/^~(?=\/)/, process.env.HOME || "~"), Number(flags.count) || 24);
    case "thumbnail":
      return renderThumbnail(episode, flags);
    case "name-card":
      return renderNameCard(episode, flags);
    default:
      fail("Usage: episode:art <episode> frames|smiles|thumbnail|name-card …");
  }
}

main().catch((error) => fail(error.message));
