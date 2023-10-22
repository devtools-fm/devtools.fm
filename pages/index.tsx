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

      <div className="mb-6">
        <LinkShieldList limit={6} />
      </div>

      <div className="mb-6 flex justify-center">
        <Link
          className="plausible-event-name=Newsletter+Subscribe+Click"
          href="https://devtoolsfm.beehiiv.com/subscribe"
        >
          Join newsletter
        </Link>
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

              <h2 className="text-xl md:text-2xl mb-2">Sponsor</h2>

              <div className="flex items-center gap-4 mb-2">
                <a
                  href="https://www.raycast.com"
                  className="block h-20 w-20 flex-shrink-0"
                >
                  <img
                    alt="Raycast Logo"
                    src="https://raycastapp.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F9dab15c5-70d8-4f0d-a8b1-604b0b85912b%2Fraycast-logo-256.png?table=block&id=ce1ccf83-06b1-4ac8-b8d4-7b3276bf34e0&spaceId=50d13040-8e7c-4990-aed4-0844f62c7aa2&width=250&userId=&cache=v2"
                  />
                </a>
                <div>
                  <P>
                    This podcast is sponsored by{" "}
                    <Link href="https://www.raycast.com">Raycast</Link>. Raycast
                    is a blazingly fast, totally extendable launcher. It lets
                    you complete tasks, calculate, ask AI questions, and much
                    more. It is a must-have app for anyone who works on a Mac.
                  </P>
                  <P>
                    Interested in sponsoring the podcast?{" "}
                    <Link href="/sponsor>">Learn more here</Link>.
                  </P>
                </div>
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
