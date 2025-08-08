import { Metadata } from "next";
import { getLatestEp } from "utils/getLatestEp";
import { SubscribeClient } from "./subscribe-client";

export const metadata: Metadata = {
  title: "devtools.fm - Subscribe",
  description: "A podcast about developer tools by the people who make them.",
  openGraph: {
    title: "devtools.fm - Subscribe",
    description: "A podcast about developer tools by the people who make them.",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Subscribe",
    description: "A podcast about developer tools by the people who make them.",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default async function SubscribePage() {
  const latestEpisode = await getLatestEp();

  return (
    <>
      <SubscribeClient latestEpisode={latestEpisode} />
    </>
  );
}