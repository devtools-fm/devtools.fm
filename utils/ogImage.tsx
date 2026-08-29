import fs from "node:fs";
import path from "node:path";

import satori from "satori";
import sharp from "sharp";

import type { ProcessedMdx } from "utils/processMdx";

export const OG_SIZE = { width: 1200, height: 630 };

export const og = {
  background: "#0b0b0f",
  surface: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.12)",
  white: "#fafafa",
  gray: "#9b9ba3",
  dimGray: "#6f6f78",
  purple: "#d075f2",
  pink: "#f583e9",
  blue: "#52a8ff",
};

const FONTS_DIR = path.join(process.cwd(), "assets", "og-fonts");
const MAX_TAGS = 3;

function loadFont(file: string) {
  const buffer = fs.readFileSync(path.join(FONTS_DIR, file));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

function getOgFonts() {
  return [
    {
      name: "JetBrains Mono",
      data: loadFont("JetBrainsMono-Regular.ttf"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: loadFont("JetBrainsMono-Medium.ttf"),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: loadFont("JetBrainsMono-Bold.ttf"),
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

function getLogoDataUri() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

function getEpisodeCount() {
  return fs
    .readdirSync(path.join(process.cwd(), "pages", "episode"))
    .filter((file) => /^\d+\.mdx$/.test(file)).length;
}

async function getEpisodeThumbnail(videoId?: string) {
  if (!videoId) return null;

  for (const variant of ["maxresdefault", "hqdefault"]) {
    try {
      const response = await fetch(
        `https://i.ytimg.com/vi/${videoId}/${variant}.jpg`
      );

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    } catch {
      // Try the lower-resolution thumbnail.
    }
  }

  return null;
}

function formatOgDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toTagList(tags?: string | string[]) {
  const list = Array.isArray(tags) ? tags : (tags || "").split(",");

  return list
    .map((tag) => tag.trim())
    .filter((tag) => tag && tag.length <= 24)
    .slice(0, MAX_TAGS);
}

function OgFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: og.background,
        backgroundImage: [
          "radial-gradient(circle at 0% 0%, rgba(208, 117, 242, 0.22), transparent 45%)",
          "radial-gradient(circle at 100% 100%, rgba(82, 168, 255, 0.18), transparent 45%)",
          "radial-gradient(circle at 85% 10%, rgba(245, 131, 233, 0.10), transparent 35%)",
        ].join(", "),
        fontFamily: "JetBrains Mono",
        color: og.white,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          background: `linear-gradient(90deg, ${og.purple}, ${og.pink}, ${og.blue})`,
        }}
      />
    </div>
  );
}

function OgChip({
  children,
  color = og.gray,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 18px",
        borderRadius: 999,
        border: `2px solid ${og.border}`,
        backgroundColor: og.surface,
        color,
        fontSize: 22,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
async function renderOgImage(element: React.ReactNode) {
  const svg = await satori(element, {
    ...OG_SIZE,
    fonts: getOgFonts(),
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}


export async function createHomeOgImage() {
  const logo = getLogoDataUri();
  const episodeCount = getEpisodeCount();

  return renderOgImage(
    <OgFrame>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexGrow: 1,
          gap: 72,
          padding: "0 88px",
        }}
      >
        <img src={logo} width={290} height={290} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            devtools.fm
          </div>
          <div
            style={{
              display: "block",
              fontSize: 32,
              lineHeight: 1.45,
              color: og.gray,
              width: 660,
            }}
          >
            A podcast about developer tools by the people who make them.
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <OgChip color={og.purple}>{`${episodeCount} episodes`}</OgChip>
            <OgChip color={og.blue}>new every Monday</OgChip>
            <OgChip>@devtools.fm</OgChip>
          </div>
        </div>
      </div>
    </OgFrame>
  );
}

export async function createEpisodeOgImage(
  episodeNumber: string,
  episode: ProcessedMdx
) {
  const { frontMatter, youtubeId, thumbnailId } = episode;
  const title = frontMatter.title;
  const guests = episode.guests.filter(
    (guest) => !title.toLowerCase().includes(guest.toLowerCase())
  );
  const tags = toTagList(frontMatter.tags);
  const publishDate = formatOgDate(
    frontMatter.publishDate || frontMatter.date || episode.postCreationDate
  );
  const [logo, thumbnail] = await Promise.all([
    getLogoDataUri(),
    getEpisodeThumbnail(thumbnailId || youtubeId),
  ]);
  const titleSize = title.length > 80 ? 44 : title.length > 50 ? 52 : 62;

  return renderOgImage(
    <OgFrame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "52px 64px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={logo} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 30, fontWeight: 700 }}>devtools.fm</div>
              <div style={{ fontSize: 20, color: og.dimGray }}>@devtools.fm</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: og.purple,
            }}
          >
            {`EPISODE #${episodeNumber}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            gap: 48,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              flexGrow: 1,
              width: thumbnail ? 680 : 1072,
            }}
          >
            <div
              style={{
                display: "block",
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                lineClamp: 4,
              }}
            >
              {title}
            </div>
            {guests.length > 0 && (
              <div
                style={{
                  display: "block",
                  fontSize: 27,
                  color: og.blue,
                  fontWeight: 500,
                  lineClamp: 2,
                }}
              >
                {`with ${guests.join(", ")}`}
              </div>
            )}
          </div>
          {thumbnail && (
            <img
              src={thumbnail}
              width={344}
              height={194}
              alt=""
              style={{
                borderRadius: 16,
                border: `3px solid ${og.border}`,
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {tags.map((tag) => (
              <OgChip key={tag}>{tag}</OgChip>
            ))}
          </div>
          {publishDate && (
            <div style={{ display: "flex", fontSize: 22, color: og.dimGray }}>
              {publishDate}
            </div>
          )}
        </div>
      </div>
    </OgFrame>
  );
}
