import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { justin, Host, andrew } from "components/Host";
import { MetaTags } from "components/MetaTags";
import { NavigationTopBar } from "components/NavigationTopBar";
import { ProcessedMdx } from "utils/processMdx";
import { EpisodeRow } from "components/EpisodeRow";
import { Link, P, Ul } from "components/system";
import { useIsClient } from "utils/useIsClient";
import { LinkShieldList } from "components/LinkShieldList";
import { getLatestEp } from "utils/getLatestEp";

interface HomeProps {
  latestEpisode: ProcessedMdx;
}

export default function Home({ latestEpisode }: HomeProps) {
  const isClient = useIsClient();
  const tags = (
    <MetaTags
      title="devtools.fm"
      description="A podcast about developer tools by the people who make them."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (!isClient) {
    return tags;
  }

  return (
    <Page hideShields>
      {tags}

      <div className="mt-10 mb-8">
        <h1 className="flex justify-center mb-6 md:mb-10">
          <Logo />
        </h1>

        <p className="text-lg text-center">
          A podcast about{" "}
          <ColoredText color="purple">developer tools</ColoredText> and the{" "}
          <ColoredText color="blue">people</ColoredText> who make them.
        </p>
      </div>

      <div className="mb-12">
        <LinkShieldList limit={5} />
      </div>

      <Browser>
        <Navigation index={0} onChange={() => {}}>
          <NavigationTopBar />

          <Navigation.Panels>
            <Navigation.Panel className="pt-4 md:pt-6 mx-3 mb-4 focus:outline-none dark:text-gray-200">
              <p
                className="mb-6 md:mb-10"
                style={{
                  fontFamily: "Menlo, monospace",
                }}
              >
                No matter what type of code you write, you're going to be
                dealing with developer tools. This podcast will explore the
                bleeding edge of modern developer tooling all up and down the
                stack. Come learn with us as we talk with industry leaders and
                taste-makers from all of the programming world.
              </p>

              <div className="mb-6">
                <h2 className="text-xl md:text-2xl">Latest Episode</h2>

                <EpisodeRow {...latestEpisode} />
              </div>

              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">
                Paid Subscribers
              </h2>

              <P>
                There are two versions of the podcast: a free version and a paid
                version. The paid version is the same as the free version, but
                with an extra 20-30 minutes of content throughout the interview
                and no ads. The paid version is available to anyone who
                subscribes to the podcast for $5/month. You can subscribe using
                any of the links below.
              </P>

              <Ul className="mb-10">
                <li>
                  <Link href="https://www.patreon.com/devtoolsfm">Patreon</Link>
                </li>
                <li>
                  <Link href="https://podcasters.spotify.com/pod/show/devtoolsfm/subscribe">
                    Spotify
                  </Link>
                </li>
                <li>
                  <Link href="https://podcasts.apple.com/us/podcast/devtools-fm/id1566647758">
                    Apple Podcasts
                  </Link>
                </li>
              </Ul>

              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Hosts</h2>

              <div className="space-y-4 md:space-y-6 ">
                <Host name="Andrew Lisowski" data={andrew} />
                <Host name="Justin Bennett" data={justin} />
              </div>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
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
