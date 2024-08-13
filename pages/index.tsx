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
import { useDarkMode } from "@devtools-ds/themes";

interface HomeProps {
  latestEpisode: ProcessedMdx;
}

export default function Home({ latestEpisode }: HomeProps) {
  const isClient = useIsClient();
  const isDarkMode = useDarkMode();
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
        <LinkShieldList limit={7} />
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
                  href="https://www.mux.com"
                  className="w-52 flex-shrink-0 flex items-center justify-center"
                >
                  <svg
                    width="387"
                    height="121"
                    viewBox="0 0 387 121"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M240.341 0C231.948 0 225.146 6.75374 225.146 15.0837V60.3443C225.146 76.9849 211.506 90.5237 194.74 90.5237C177.975 90.5237 164.334 76.9849 164.334 60.3443V15.0837C164.334 6.75374 157.53 0 149.14 0C140.75 0 133.946 6.75374 133.946 15.0837V60.3443C133.946 93.6182 161.219 120.689 194.743 120.689C228.266 120.689 255.54 93.6182 255.54 60.3443V15.0837C255.54 6.75374 248.735 0 240.345 0H240.341ZM240.341 25.4629C234.565 25.4629 229.883 20.8164 229.883 15.0837C229.883 9.35096 234.565 4.70444 240.341 4.70444C246.116 4.70444 250.798 9.35096 250.798 15.0837C250.798 20.8164 246.116 25.4629 240.341 25.4629Z"
                      fill={isDarkMode ? "white" : "black"}
                    />
                    <path
                      d="M304.382 60.3443L269.526 94.9409C263.592 100.831 263.592 110.382 269.526 116.271C275.459 122.161 285.082 122.161 291.016 116.271L325.872 81.6748L360.728 116.271C366.662 122.161 376.285 122.161 382.219 116.271C388.153 110.382 388.153 100.831 382.219 94.9409L347.363 60.3443L382.219 25.7477C388.153 19.8581 388.153 10.3068 382.219 4.4172C376.285 -1.4724 366.662 -1.4724 360.728 4.4172L325.872 39.0138L291.016 4.4172C285.082 -1.4724 275.459 -1.4724 269.526 4.4172C263.592 10.3068 263.592 19.8581 269.526 25.7477L304.382 60.3443ZM371.472 115.984C365.697 115.984 361.015 111.338 361.015 105.605C361.015 99.8723 365.697 95.2257 371.472 95.2257C377.248 95.2257 381.93 99.8723 381.93 105.605C381.93 111.338 377.248 115.984 371.472 115.984Z"
                      fill={isDarkMode ? "white" : "black"}
                    />
                    <path
                      d="M112.214 1.14895C106.536 -1.18517 99.999 0.103787 95.6532 4.4172L60.7971 39.0138L25.9409 4.4172C21.5951 0.103787 15.0582 -1.18517 9.37977 1.14895C3.70132 3.48307 0 8.98164 0 15.0837V105.605C0 113.935 6.80441 120.689 15.1968 120.689C23.5893 120.689 30.3937 113.935 30.3937 105.605V51.4954L50.053 71.0084C55.9868 76.898 65.6098 76.898 71.5436 71.0084L91.2029 51.4954V105.605C91.2029 113.935 98.0073 120.689 106.4 120.689C114.792 120.689 121.597 113.935 121.597 105.605V15.0837C121.597 8.98406 117.895 3.48307 112.217 1.14895H112.214ZM106.4 115.987C100.624 115.987 95.9426 111.34 95.9426 105.607C95.9426 99.8747 100.624 95.2282 106.4 95.2282C112.175 95.2282 116.857 99.8747 116.857 105.607C116.857 111.34 112.175 115.987 106.4 115.987Z"
                      fill={isDarkMode ? "white" : "black"}
                    />
                  </svg>
                </a>
                <div>
                  <P>
                    This podcast is sponsored by{" "}
                    <Link href="https://www.mux.com/">Mux</Link>. Mux helps you
                    to build and monitor high-performance video playback in your
                    web and mobile apps
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
