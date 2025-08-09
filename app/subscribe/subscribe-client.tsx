"use client";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Link } from "components/system";
import { LinkShieldList } from "components/LinkShieldList";
import { ProcessedMdx } from "utils/processMdx";
import { NewsLetterSubscribe } from "components/NewsletterSubscribe";

interface SubscribeClientProps {
  latestEpisode: ProcessedMdx;
}

export function SubscribeClient({ latestEpisode }: SubscribeClientProps) {
  return (
    <Page hideFooter>
      <div className="h-full flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="flex justify-center mb-2 md:mb-6">
            <Link
              href="/"
              className="plausible-event-name=Shield+Click plausible-event-position=home+page"
            >
              <Logo />
            </Link>
          </h1>

          <p className="text-lg text-center mb-2">
            A podcast about{" "}
            <ColoredText color="purple">developer tools</ColoredText> and the{" "}
            <ColoredText color="blue">people</ColoredText> who make them.
          </p>

          <div className="mb-6 flex justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${latestEpisode.youtubeId}`}
              className="my-0 plausible-event-name=Shield+Click plausible-event-position=latest+episode"
            >
              <div className="w-full h-[fit-content]">
                <img
                  className="max-w-64 rounded-lg h-full max-h-[150px]"
                  src={`https://i.ytimg.com/vi/${
                    latestEpisode.thumbnailId || latestEpisode.youtubeId
                  }/maxresdefault.jpg`}
                />
              </div>
            </a>
          </div>

          <p className="text-center">
            Click an icon below to follow us on your favorite platform.
          </p>
        </div>

        <div className="mb-12">
          <LinkShieldList />
        </div>

        <div className="mb-12">
          <NewsLetterSubscribe />
        </div>
      </div>
    </Page>
  );
}