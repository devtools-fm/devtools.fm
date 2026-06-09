import { Metadata } from "next";
import { getLatestEp } from "utils/getLatestEp";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "devtools.fm",
  description: "A podcast about developer tools by the people who make them.",
  openGraph: {
    title: "devtools.fm",
    description: "A podcast about developer tools by the people who make them.",
    url: "https://devtools.fm/",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://devtools.fm/",
    title: "devtools.fm",
    description: "A podcast about developer tools by the people who make them.",
  },
};

export default async function Home() {
  const latestEpisode = await getLatestEp();

  return <HomeClient latestEpisode={latestEpisode} />;
}