import { Metadata } from "next";
import { SponsorClient } from "./sponsor-client";

export const metadata: Metadata = {
  title: "devtools.fm - Sponsor",
  description: "Sponsor devtools.fm and reach developers passionate about building tools",
  openGraph: {
    title: "devtools.fm - Sponsor", 
    description: "Sponsor devtools.fm and reach developers passionate about building tools",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Sponsor",
    description: "Sponsor devtools.fm and reach developers passionate about building tools",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default function SponsorPage() {
  return (
    <>
      <SponsorClient />
    </>
  );
}