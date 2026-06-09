import fs from "fs";
import path from "path";

export const SITE_URL = "https://devtools.fm";
export const SEQUOIA_CONTENT_DIR = path.join(
  process.cwd(),
  ".generated",
  "sequoia-content"
);
export const SEQUOIA_CONFIG_FILE = path.join(process.cwd(), "sequoia.json");

let cachedPublicationUri: string | null | undefined;

export function getSequoiaPublicationUri(): string | null {
  if (cachedPublicationUri !== undefined) {
    return cachedPublicationUri;
  }

  let publicationUri: string | null = null;

  try {
    const config = JSON.parse(fs.readFileSync(SEQUOIA_CONFIG_FILE, "utf8"));
    publicationUri =
      typeof config.publicationUri === "string" ? config.publicationUri : null;
  } catch {
    publicationUri = null;
  }

  cachedPublicationUri = publicationUri;
  return publicationUri;
}

export function getSequoiaDocumentUri(episodeNumber: string): string | null {
  try {
    const generatedPath = path.join(SEQUOIA_CONTENT_DIR, `${episodeNumber}.md`);
    const file = fs.readFileSync(generatedPath, "utf8");
    const match = file.match(/^atUri:\s*(.+)$/m);
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}
