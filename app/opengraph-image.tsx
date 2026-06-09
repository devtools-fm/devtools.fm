import { ImageResponse } from "next/og";

import {
  OG_SIZE,
  OgChip,
  OgFrame,
  getEpisodeCount,
  getLogoDataUri,
  getOgFonts,
  og,
} from "utils/ogImage";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const logo = getLogoDataUri();
  const episodeCount = getEpisodeCount();

  return new ImageResponse(
    (
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
    ),
    { ...size, fonts: getOgFonts() }
  );
}
