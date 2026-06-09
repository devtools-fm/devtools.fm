import { ImageResponse } from "next/og";
import path from "path";

import { processMdx } from "utils/processMdx";
import {
  OG_SIZE,
  OgChip,
  OgFrame,
  formatOgDate,
  getEpisodeThumbnail,
  getLogoDataUri,
  getOgFonts,
  og,
} from "utils/ogImage";

export const size = OG_SIZE;
export const contentType = "image/png";

const MAX_TAGS = 3;

function toTagList(tags?: string | string[]) {
  const list = Array.isArray(tags) ? tags : (tags || "").split(",");

  return list
    .map((tag) => tag.trim())
    .filter((tag) => tag && tag.length <= 24)
    .slice(0, MAX_TAGS);
}

export default async function Image({
  params,
}: {
  params: Promise<{ episodeNumber: string }>;
}) {
  const { episodeNumber } = await params;
  const processedMdx = await processMdx(
    path.join(process.cwd(), `pages/episode/${episodeNumber}.mdx`),
    {},
    false,
    true
  );

  const { frontMatter, youtubeId, thumbnailId } = processedMdx;
  const title = frontMatter.title;
  // Transcript-derived guest names are often first-name-only; skip any that
  // already appear in the title so the byline never repeats it.
  const guests = processedMdx.guests.filter(
    (guest) => !title.toLowerCase().includes(guest.toLowerCase())
  );
  const tags = toTagList(frontMatter.tags);
  const publishDate = formatOgDate(
    frontMatter.publishDate || frontMatter.date || processedMdx.postCreationDate
  );
  const [logo, thumbnail] = await Promise.all([
    getLogoDataUri(),
    getEpisodeThumbnail(thumbnailId || youtubeId),
  ]);

  const titleSize = title.length > 80 ? 44 : title.length > 50 ? 52 : 62;

  return new ImageResponse(
    (
      <OgFrame>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "52px 64px 48px",
          }}
        >
          {/* Header: publication identity */}
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  devtools.fm
                </div>
                <div style={{ fontSize: 20, color: og.dimGray }}>
                  @devtools.fm
                </div>
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

          {/* Body: title + guests beside the episode thumbnail */}
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

          {/* Footer: document metadata */}
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
              <div
                style={{ display: "flex", fontSize: 22, color: og.dimGray }}
              >
                {publishDate}
              </div>
            )}
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: getOgFonts() }
  );
}
