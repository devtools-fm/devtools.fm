import { Metadata } from "next";
import { GuestsClient } from "./guests-client";

export const metadata: Metadata = {
  title: "devtools.fm - Guests",
  description: "Apply to be a guest on devtools.fm",
  openGraph: {
    title: "devtools.fm - Guests",
    description: "Apply to be a guest on devtools.fm",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Guests",
    description: "Apply to be a guest on devtools.fm",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default function GuestsPage() {
  return (
    <>
      <GuestsClient />
    </>
  );
}