import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { MetaTags } from "components/MetaTags";
import { Link } from "components/system";
import { useIsClient } from "utils/useIsClient";
import { LinkShieldList } from "components/LinkShieldList";
import { getLatestEp } from "utils/getLatestEp";
import { ProcessedMdx } from "utils/processMdx";
import makeClass from "clsx";

interface SubscribeProps {
  latestEpisode: ProcessedMdx;
}

export default function Subscribe({ latestEpisode }: SubscribeProps) {
  const isClient = useIsClient();
  const tags = (
    <MetaTags
      title="devtools.fm - Subscribe"
      description="A podcast about developer tools by the people who make them."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (!isClient) {
    return tags;
  }

  return (
    <Page hideFooter>
      {tags}

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
            <Link
              href={`episode/${latestEpisode.number}`}
              className="my-0 plausible-event-name=Shield+Click plausible-event-position=latest+episode"
            >
              <div className="w-full h-[fit-content]">
                <img
                  className="max-w-64 rounded-lg h-full max-h-[150px]"
                  src={`https://i.ytimg.com/vi/${latestEpisode.youtubeId}/maxresdefault.jpg`}
                />
              </div>
            </Link>
          </div>

          <p className="text-center">
            Click an icon below to follow us on your favorite platform.
          </p>
        </div>

        <LinkShieldList />
      </div>
    </Page>
  );
}

export async function getStaticProps() {
  return {
    props: {
      latestEpisode: await getLatestEp(),
    },
  };
}
