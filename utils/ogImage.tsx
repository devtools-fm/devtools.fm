import fs from "fs";
import path from "path";

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

function loadFont(file: string) {
  const buffer = fs.readFileSync(path.join(FONTS_DIR, file));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

export function getOgFonts() {
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

export function getLogoDataUri() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export function getEpisodeCount() {
  return fs
    .readdirSync(path.join(process.cwd(), "pages", "episode"))
    .filter((file) => /^\d+\.mdx$/.test(file)).length;
}

export async function getEpisodeThumbnail(videoId?: string) {
  if (!videoId) {
    return null;
  }

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
      // Fall through to the next thumbnail variant.
    }
  }

  return null;
}

export function formatOgDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Full-bleed frame with the brand background + glows shared by every OG card. */
export function OgFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: og.background,
        backgroundImage: [
          `radial-gradient(circle at 0% 0%, rgba(208, 117, 242, 0.22), transparent 45%)`,
          `radial-gradient(circle at 100% 100%, rgba(82, 168, 255, 0.18), transparent 45%)`,
          `radial-gradient(circle at 85% 10%, rgba(245, 131, 233, 0.10), transparent 35%)`,
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

export function OgChip({
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
