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
                  href="https://clerk.com"
                  className="h-20 w-20 flex-shrink-0 flex items-center justify-center"
                >
                  <svg
                    width="80"
                    height="96"
                    viewBox="0 0 20 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.116 3.1608L16.2354 6.04135C16.1449 6.13177 16.0266 6.18918 15.8996 6.20437C15.7725 6.21956 15.6441 6.19165 15.5348 6.12513C14.4017 5.44155 13.0949 5.10063 11.7722 5.14354C10.4495 5.18645 9.16759 5.61134 8.08114 6.36692C7.41295 6.83202 6.83276 7.41221 6.36765 8.0804C5.61297 9.16751 5.18848 10.4495 5.14524 11.7722C5.10201 13.0949 5.44187 14.4019 6.12395 15.536C6.19 15.6451 6.21764 15.7731 6.20246 15.8998C6.18728 16.0264 6.13015 16.1443 6.04018 16.2347L3.15962 19.1152C3.10162 19.1736 3.03168 19.2188 2.95459 19.2476C2.87751 19.2765 2.79511 19.2883 2.71302 19.2824C2.63093 19.2764 2.5511 19.2528 2.479 19.2131C2.40689 19.1734 2.34422 19.1186 2.29527 19.0524C0.736704 16.9101 -0.0687588 14.3121 0.0046021 11.6639C0.077963 9.01568 1.02602 6.46625 2.70079 4.41354C3.21208 3.78549 3.78622 3.21134 4.41428 2.70006C6.46683 1.02574 9.01589 0.0779624 11.6637 0.00460332C14.3115 -0.0687557 16.9091 0.736432 19.0512 2.29453C19.1179 2.34332 19.1731 2.40598 19.2131 2.47818C19.2532 2.55038 19.2771 2.6304 19.2833 2.71274C19.2895 2.79508 19.2777 2.87778 19.2488 2.95513C19.2199 3.03248 19.1746 3.10265 19.116 3.1608Z"
                      fill="url(#paint0_linear_26571_214331)"
                    ></path>
                    <path
                      d="M19.1135 20.8289L16.2329 17.9483C16.1424 17.8579 16.0241 17.8005 15.8971 17.7853C15.7701 17.7701 15.6416 17.798 15.5323 17.8645C14.4639 18.509 13.2398 18.8497 11.9921 18.8497C10.7443 18.8497 9.52022 18.509 8.45181 17.8645C8.34252 17.798 8.21406 17.7701 8.08701 17.7853C7.95997 17.8005 7.84171 17.8579 7.75119 17.9483L4.87063 20.8289C4.81022 20.8869 4.76333 20.9576 4.73329 21.0358C4.70324 21.114 4.69078 21.1979 4.69678 21.2815C4.70277 21.3651 4.72708 21.4463 4.76799 21.5194C4.80889 21.5926 4.86538 21.6558 4.93346 21.7046C6.98391 23.1965 9.45442 24.0001 11.9902 24.0001C14.5259 24.0001 16.9964 23.1965 19.0469 21.7046C19.1152 21.6561 19.172 21.5931 19.2133 21.5201C19.2545 21.4471 19.2792 21.366 19.2856 21.2824C19.2919 21.1988 19.2798 21.1148 19.2501 21.0365C19.2203 20.9581 19.1737 20.8872 19.1135 20.8289V20.8289Z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M11.9973 15.4223C13.8899 15.4223 15.4243 13.888 15.4243 11.9953C15.4243 10.1027 13.8899 8.56836 11.9973 8.56836C10.1046 8.56836 8.57031 10.1027 8.57031 11.9953C8.57031 13.888 10.1046 15.4223 11.9973 15.4223Z"
                      fill="currentColor"
                    ></path>
                    <defs>
                      <linearGradient
                        id="paint0_linear_26571_214331"
                        x1="16.4087"
                        y1="-1.75881"
                        x2="-7.88473"
                        y2="22.5365"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#17CCFC"></stop>
                        <stop offset="0.5" stop-color="#5D31FF"></stop>
                        <stop offset="1" stop-color="#F35AFF"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </a>
                <div>
                  <P>
                    This podcast is sponsored by{" "}
                    <Link href="https://clerk.com/">Clerk</Link>. Clerk is a
                    complete suite of embeddable UIs, flexible APIs, and admin
                    dashboards to authenticate and manage your users.
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
