"use client";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import Link from "next/link";
import { ChevronLeftIcon } from "@devtools-ds/icon";

export function ThankYouClient() {
  return (
    <Page>
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Link
          className="absolute top-0 left-0 mx-8 my-2 py-4 flex items-center space-x-2 hover:pointer"
          href="/"
        >
          <ChevronLeftIcon size="medium" />
          <span className="text-lg">Home</span>
        </Link>
        <div>
          <h1 className="flex justify-center mb-10">
            <Logo />
          </h1>

          <p className="text-2xl text-center mb-8">
            <ColoredText color="purple">Thank you for applying!</ColoredText>{" "}
          </p>
          <p className="text-lg text-center">
            We'll be in touch if we're interested!
          </p>
        </div>
      </div>
    </Page>
  );
}