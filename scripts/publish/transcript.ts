/**
 * Cleanups shared by every transcript the pipeline publishes (website MDX, Patreon .txt).
 */

/**
 * Descript labels speakers with the Riverside file names unless the editor renamed them:
 * `riverside_boris_raw-video-cfr_devtools.fm_0488` → `Boris`. Markdown exports escape the
 * underscores, so unescape first.
 */
export function speakerName(label: string) {
  const plain = label.replace(/\\_/g, "_").trim();
  const riverside = plain.match(/^riverside_([a-z]+)/i);
  if (!riverside) return plain;
  return riverside[1].charAt(0).toUpperCase() + riverside[1].slice(1).toLowerCase();
}

/** Whole-word replacements for transcription mistakes, e.g. { "Tain": "Tane" }. */
export function applyCorrections(text: string, corrections: Record<string, string> = {}) {
  return Object.entries(corrections).reduce(
    (result, [wrong, right]) =>
      result.replace(new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), right),
    text
  );
}

/** Descript's plain-text export → readable transcript with real speaker names. */
export function cleanPlainTranscript(
  raw: string,
  corrections: Record<string, string> = {},
  speakers: Record<string, string> = {}
) {
  return raw
    .replace(/\u200b/g, "")
    .split("\n")
    .map((line) =>
      line.replace(/^([^:\n]{1,80}):(\s)/, (match, label, space) => {
        const name = speakerName(label);
        return `${speakers[name] ?? name}:${space}`;
      })
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => applyCorrections(line, corrections))
    .join("\n")
    .trim();
}
