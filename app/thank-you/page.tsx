import { Metadata } from "next";
import { ThankYouClient } from "./thank-you-client";

export const metadata: Metadata = {
  title: "devtools.fm - Submission Received",
  description: "",
  openGraph: {
    title: "devtools.fm - Submission Received",
    description: "",
    images: ["https://devtools.fm/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.fm - Submission Received",
    description: "",
    images: ["https://devtools.fm/og-image.png"],
  },
};

export default function ThankYouPage() {
  return (
    <>
      <ThankYouClient />
    </>
  );
}