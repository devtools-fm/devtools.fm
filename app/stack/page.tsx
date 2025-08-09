import { Metadata } from "next";
import { StackClient } from "./stack-client";

export const metadata: Metadata = {
  title: "devtools.fm - Stack",
  description: "The tools we use to produce and publish and episode of devtools.fm",
  openGraph: {
    title: "devtools.fm - Stack",
    description: "The tools we use to produce and publish and episode of devtools.fm",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Stack",
    description: "The tools we use to produce and publish and episode of devtools.fm",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default function StackPage() {
  return (
    <>
      <StackClient />
    </>
  );
}