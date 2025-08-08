import { Metadata } from "next";
import { GuestInfoClient } from "./guest-info-client";

export const metadata: Metadata = {
  title: "devtools.fm - Guest Info",
  description: "A brief overview of what to expect when you're a guest on devtools.fm.",
  openGraph: {
    title: "devtools.fm - Guest Info",
    description: "A brief overview of what to expect when you're a guest on devtools.fm.",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Guest Info",
    description: "A brief overview of what to expect when you're a guest on devtools.fm.",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default function GuestInfoPage() {
  return (
    <>
      <GuestInfoClient />
    </>
  );
}